import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const block = (selector) => {
  const open = css.indexOf(selector)
  return css.slice(open, css.indexOf('}', open))
}
// Tokens are stored as sRGB channels so Tailwind's opacity modifiers compile.
// The table below is read by a person, so channels are folded back to hex here.
const hex = (ch) =>
  '#' + ch.split(/\s+/).map((c) => Number(c).toString(16).padStart(2, '0')).join('')
const tokensOf = (root) => Object.fromEntries(
  [...root.matchAll(/--([\w-]+):\s*(\d{1,3}\s+\d{1,3}\s+\d{1,3})\s*;/g)].map((m) => [
    m[1],
    hex(m[2]),
  ])
)
const themes = {
  light: tokensOf(block(':root {')),
  dark: tokensOf(block(":root[data-theme='dark'] {")),
}

const lin = (c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * lin(n >> 16 & 255) + 0.7152 * lin(n >> 8 & 255) + 0.0722 * lin(n & 255)
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (hi + 0.05) / (lo + 0.05)
}

// Tokens that carry text must clear WCAG AA on the ground and on surface, the
// ground of code blocks and figures. The rest are reported only.
const TEXT = ['heading', 'foreground', 'muted', 'accent', 'sun', 'sky']
const DECORATIVE = ['surface', 'border', 'muted-dark']
const MIN = 4.5

let failed = false

// The dark values are written twice, once for the switch and once for the
// system setting. A drift between the two copies is a failure.
const system = tokensOf(block(":root:not([data-theme='light']) {"))
if (JSON.stringify(system) !== JSON.stringify(themes.dark)) {
  failed = true
  console.log('FAIL  the two dark blocks in globals.css hold different values')
}

for (const [theme, tokens] of Object.entries(themes)) {
  console.log(`\n${theme}`)
  for (const name of TEXT) {
    const r = ratio(tokens.background, tokens[name])
    const rs = ratio(tokens.surface, tokens[name])
    const ok = r >= MIN && rs >= MIN
    if (!ok) failed = true
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(12)} ${tokens[name]}  ${r.toFixed(2)}  ${rs.toFixed(2)}`)
  }
  for (const name of DECORATIVE) {
    console.log(`      ${name.padEnd(12)} ${tokens[name]}  ${ratio(tokens.background, tokens[name]).toFixed(2)}  decorative, never text`)
  }
}
process.exit(failed ? 1 : 0)
