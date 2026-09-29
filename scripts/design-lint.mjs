import { readdirSync, readFileSync, statSync } from 'node:fs'

// Design-system gate. contrast.mjs rates the token values; this rates the way
// components spend them. Rules are documented in docs/design-system.md.
//
// Every rule below has a baseline: the number of violations standing when the
// gate was written. The gate fails when a count rises above its baseline, so
// new code is held to the rule while the existing backlog stays visible and
// stays runnable. Lower a baseline whenever a count drops.

const ROOTS = ['app', 'components']
const EXT = /\.(tsx|ts|css)$/
// The lens-test page is archived: unlinked from nav and sitemap, out of scope
// for the identity rebuild.
const SKIP = ['components/lens-test']

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const path = `${dir}/${name}`
    if (SKIP.some((s) => path.startsWith(s))) continue
    if (statSync(path).isDirectory()) walk(path, out)
    else if (EXT.test(name)) out.push(path)
  }
  return out
}

// Canvas numbers that are allowed to live outside Canvas.tsx, one reason each.
const CANVAS_ALLOW = [
  { file: 'components/Navigation.tsx', value: '1168', why: 'chrome aligns its outer edge to the canvas but has no tracks to inherit' },
  { file: 'components/Footer.tsx', value: '1168', why: 'same as Navigation' },
  { file: 'app/globals.css', value: '660', why: 'the prose measure equals the reading track and CSS cannot read the component' },
  { file: 'app/globals.css', value: '160', why: 'grain tile is a 160px square, unrelated to the gutter' },
  { file: 'app/blog/[slug]/page.tsx', value: '660', why: 'post header restates the measure below the collapse, where the track is gone' },
  { file: 'components/mdx/ScrollFigure.tsx', value: '660', why: 'the figure reading width matches the reading track' },
  { file: 'components/mdx/MarginNote.tsx', value: '220', why: 'the note is absolutely positioned out of the grid and carries the right-track width itself' },
  { file: 'components/mdx/PromptDefenseBehaviorGeometryFigure.tsx', value: '160', why: 'SVG x coordinate at the centre of a 320-wide viewBox' },
]

const RULES = [
  {
    id: 'muted-dark-text',
    what: 'text-muted-dark outside Rule.tsx',
    why: 'muted-dark sits at 2.37 against the ground and fails AA at every size',
    baseline: 0,
    pattern: /text-muted-dark/g,
    skip: (file) => file === 'components/ui/Rule.tsx',
  },
  {
    id: 'hex-literal',
    what: 'six-digit hex literal',
    why: 'colour is the tokens defined once in globals.css; a literal escapes the palette',
    baseline: 1,
    pattern: /#[0-9a-fA-F]{6}\b/g,
    skip: (file) => file === 'app/globals.css',
  },
  {
    id: 'canvas-number',
    what: 'canvas number (1168, 660, 220, 160) outside Canvas.tsx',
    why: 'the tracks and the page width are defined once, in Canvas.tsx',
    baseline: 0,
    pattern: /(?<![\d.A-Za-z])(1168|660|220|160)(?:px|rem)?(?![\d.A-Za-z])/g,
    skip: (file) => file === 'components/layout/Canvas.tsx',
    allow: (file, text) =>
      CANVAS_ALLOW.some((e) => e.file === file && text.startsWith(e.value)),
  },
  {
    id: 'arbitrary-size',
    what: 'arbitrary font size, the text-[Npx] form',
    why: 'the scale is nine steps; an arbitrary size answers to nothing',
    baseline: 1,
    pattern: /text-\[\d+(?:\.\d+)?px\]/g,
  },
  {
    id: 'off-scale-size',
    what: "Tailwind's own size names",
    why: 'the scale is tick, meta, sm, base, lead, h3, h2, h1, display, hero; the default names are a second scale',
    baseline: 2,
    pattern: /\btext-(?:xs|lg|xl|2xl|3xl|4xl)\b/g,
  },
]

const files = ROOTS.flatMap((root) => walk(root))

let failed = false
const summary = []

for (const rule of RULES) {
  const hits = []
  for (const file of files) {
    if (rule.skip?.(file)) continue
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      for (const m of line.matchAll(rule.pattern)) {
        if (rule.allow?.(file, m[0])) continue
        hits.push(`${file}:${i + 1}  ${m[0]}  |  ${line.trim().slice(0, 96)}`)
      }
    })
  }
  if (hits.length) {
    console.log(`\n${rule.what}  (${rule.why})`)
    for (const hit of hits) console.log(`  ${hit}`)
  }
  if (hits.length > rule.baseline) failed = true
  summary.push({ rule, count: hits.length })
}

console.log('')
for (const { rule, count } of summary) {
  const state = count > rule.baseline ? 'FAIL' : 'PASS'
  const gap =
    count > rule.baseline
      ? `${count - rule.baseline} above baseline`
      : count < rule.baseline
        ? `under baseline, lower it to ${count}`
        : count === 0
          ? 'clean'
          : `${count} left to remove`
  console.log(`${state}  ${rule.id.padEnd(16)} ${String(count).padStart(3)}  baseline ${String(rule.baseline).padStart(3)}  ${gap}`)
}

process.exit(failed ? 1 : 0)
