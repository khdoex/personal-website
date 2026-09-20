import { chromium } from 'playwright'

const [url, width, expr] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  reducedMotion: process.env.PROBE_REDUCED === '1' ? 'reduce' : 'no-preference',
})
await page.goto(url, { waitUntil: 'networkidle' })
console.log(JSON.stringify(await page.evaluate(expr), null, 2))
await browser.close()
