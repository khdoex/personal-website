import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/fare', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.screenshot({ path: '/tmp/fare-screenshot.png', fullPage: false });
await browser.close();
console.log('Screenshot saved to /tmp/fare-screenshot.png');
