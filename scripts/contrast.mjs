import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const open = css.indexOf(':root')
const root = css.slice(open, css.indexOf('}', open))
// Tokens are stored as sRGB channels so Tailwind's opacity modifiers compile.
// The table below is read by a person, so channels are folded back to hex here.
const hex = (ch) =>
  '#' + ch.split(/\s+/).map((c) => Number(c).toString(16).padStart(2, '0')).join('')
const tokens = Object.fromEntries(
  [...root.matchAll(/--([\w-]+):\s*(\d{1,3}\s+\d{1,3}\s+\d{1,3})\s*;/g)].map((m) => [
    m[1],
    hex(m[2]),
  ])
)

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
for (const name of TEXT) {
  const r = ratio(tokens.background, tokens[name])
  const rs = ratio(tokens.surface, tokens[name])
  const ok = r >= MIN && rs >= MIN
  if (!ok) failed = true
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(12)} ${tokens[name]}  ${r.toFixed(2)}  ${rs.toFixed(2)}`)
}
// Graded steps that colour text, as [token, alpha, where]. Each one is the
// token blended over the ground at that alpha, and has the same 4.5 floor.
// None stand today: on the light ground a graded step loses AA long before it
// looks lighter, so text takes a full token instead.
const GRADED_TEXT = []
const blend = (fg, bg, a) => {
  const ch = (h, k) => parseInt(h.slice(1 + 2 * k, 3 + 2 * k), 16)
  return '#' + [0, 1, 2].map((k) => Math.round(ch(fg, k) * a + ch(bg, k) * (1 - a)).toString(16).padStart(2, '0')).join('')
}
for (const [name, alpha, where] of GRADED_TEXT) {
  const r = ratio(tokens.background, blend(tokens[name], tokens.background, alpha))
  const rs = ratio(tokens.surface, blend(tokens[name], tokens.surface, alpha))
  const ok = r >= MIN && rs >= MIN
  if (!ok) failed = true
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${`${name}/${alpha}`.padEnd(12)} ${where}  ${r.toFixed(2)}  ${rs.toFixed(2)}`)
}
for (const name of DECORATIVE) {
  console.log(`      ${name.padEnd(12)} ${tokens[name]}  ${ratio(tokens.background, tokens[name]).toFixed(2)}  decorative, never text`)
}
process.exit(failed ? 1 : 0)
