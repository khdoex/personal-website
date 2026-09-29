import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const OUT = process.env.OUT_DIR ?? '.verify/current'
const ROUTES = {
  home: '/',
  tr: '/tr',
  about: '/about',
  blog: '/blog',
  // The rich essay is an unlisted draft and 404s, so the sweep would have
  // been measuring a 404 page. master is the only post that still renders;
  // it exercises the markdown branch of the template, not the rich one.
  post: '/blog/master',
  projects: '/projects',
  resume: '/resume',
  notFound: '/this-route-does-not-exist',
}
const WIDTHS = [1440, 1024, 900, 768, 375]

mkdirSync(OUT, { recursive: true })
// CHROMIUM_PATH points at a system Chromium where Playwright's own download
// is unavailable (sandboxed CI, cloud sessions).
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
)
let failed = false

for (const [name, path] of Object.entries(ROUTES)) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: true })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    const ok = overflow <= 1 && errors.length === 0
    if (!ok) failed = true
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(9)} ${String(width).padStart(4)}  overflow=${overflow}px  errors=${errors.length}`
    )
    for (const e of errors) console.log(`        ${e}`)
    await page.close()
  }
}

await browser.close()
process.exit(failed ? 1 : 0)
