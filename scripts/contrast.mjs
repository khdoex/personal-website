import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const open = css.indexOf(':root')
const root = css.slice(open, css.indexOf('}', open))
const tokens = Object.fromEntries(
  [...root.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]])
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

// Tokens that carry text must clear WCAG AA. The rest are reported only.
const TEXT = ['heading', 'foreground', 'muted', 'accent', 'amber']
const DECORATIVE = ['surface', 'border', 'muted-dark']
const MIN = 4.5

let failed = false
for (const name of TEXT) {
  const r = ratio(tokens.background, tokens[name])
  if (r < MIN) failed = true
  console.log(`${r >= MIN ? 'PASS' : 'FAIL'}  ${name.padEnd(12)} ${tokens[name]}  ${r.toFixed(2)}`)
}
for (const name of DECORATIVE) {
  console.log(`      ${name.padEnd(12)} ${tokens[name]}  ${ratio(tokens.background, tokens[name]).toFixed(2)}  decorative, never text`)
}
process.exit(failed ? 1 : 0)
