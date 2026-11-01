import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../screenshots-v2');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Wait for page to fully load
async function waitAndShot(url, filename, scrollFraction = 0, waitExtra = 0) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500 + waitExtra);

  if (scrollFraction > 0) {
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(bodyHeight * scrollFraction));
    await page.waitForTimeout(800);
  }

  await page.screenshot({ path: path.join(OUT, filename), fullPage: false });
  console.log(`✓ ${filename}`);
}

// Main portfolio page
await waitAndShot('http://localhost:3000', '01-hero-top.png', 0, 2000);
await waitAndShot('http://localhost:3000', '02-hero-scroll-10pct.png', 0.04);
await waitAndShot('http://localhost:3000', '03-about.png', 0.22);
await waitAndShot('http://localhost:3000', '04-skills.png', 0.32);
await waitAndShot('http://localhost:3000', '05-experience.png', 0.47);
await waitAndShot('http://localhost:3000', '06-projects.png', 0.60);
await waitAndShot('http://localhost:3000', '07-education.png', 0.78);
await waitAndShot('http://localhost:3000', '08-contact.png', 0.95);

// Malaysia page
await page.goto('http://localhost:3000/malaysia', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, '09-malaysia-top.png'), fullPage: false });
console.log('✓ 09-malaysia-top.png');

const mHeight = await page.evaluate(() => document.body.scrollHeight);
await page.evaluate((y) => window.scrollTo(0, y), Math.round(mHeight * 0.5));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, '10-malaysia-mid.png'), fullPage: false });
console.log('✓ 10-malaysia-mid.png');

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, '11-malaysia-bottom.png'), fullPage: false });
console.log('✓ 11-malaysia-bottom.png');

await browser.close();
console.log('\nAll screenshots saved to ./screenshots-v2/');
