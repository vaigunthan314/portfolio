import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../screenshots-v3');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

console.log('Navigating to http://localhost:3000...');
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// Screenshot 1: Loader with choices
await page.screenshot({ path: path.join(OUT, '01-loader-ready.png'), fullPage: false });
console.log('✓ 01-loader-ready.png');

// Click ENTER WITH SOUND or ENTER SILENT
const enterBtn = page.locator('button:has-text("ENTER SILENT")');
if (await enterBtn.isVisible()) {
  await enterBtn.click();
  console.log('Clicked ENTER SILENT');
}
await page.waitForTimeout(2000);

// Screenshot 2: Hero start with letterbox & Beat 1
await page.screenshot({ path: path.join(OUT, '02-hero-start.png'), fullPage: false });
console.log('✓ 02-hero-start.png');

// Function to scroll hero pin to a specific fraction
async function scrollHero(fraction, filename) {
  const pinWrapper = await page.$('.hero-pinned-wrapper');
  if (pinWrapper) {
    const box = await pinWrapper.boundingBox();
    if (box) {
      const targetY = box.y + (box.height * fraction);
      await page.evaluate((y) => window.scrollTo(0, y), targetY);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(OUT, filename), fullPage: false });
      console.log(`✓ ${filename}`);
    }
  }
}

// Hero Beat 2 (around 25% of hero scroll)
await scrollHero(0.25, '03-hero-beat2-behind-me.png');

// Hero Beat 3 (headphones scene around 50% of hero scroll)
await scrollHero(0.55, '04-hero-beat3-headphones.png');

// Hero Beat 4 (cue to enter around 85% of hero)
await scrollHero(0.85, '05-hero-beat4-cue.png');

// Scroll to sections
async function scrollToSection(selector, filename) {
  const el = await page.$(selector);
  if (el) {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, filename), fullPage: false });
    console.log(`✓ ${filename}`);
  }
}

await scrollToSection('#about', '06-section-about.png');
await scrollToSection('#skills', '07-section-skills.png');
await scrollToSection('#experience', '08-section-experience.png');
await scrollToSection('#projects', '09-section-projects.png');
await scrollToSection('#education', '10-section-education.png');
await scrollToSection('#contact', '11-section-contact.png');

// Test /malaysia page
console.log('Navigating to http://localhost:3000/malaysia...');
await page.goto('http://localhost:3000/malaysia', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, '12-malaysia-hero.png'), fullPage: false });
console.log('✓ 12-malaysia-hero.png');

const storySec = await page.$('.my-text-block');
if (storySec) {
  await storySec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, '13-malaysia-story.png'), fullPage: false });
  console.log('✓ 13-malaysia-story.png');
}

const certSec = await page.$('.my-cert-block');
if (certSec) {
  await certSec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, '14-malaysia-cert.png'), fullPage: false });
  console.log('✓ 14-malaysia-cert.png');
}

await browser.close();
console.log('\nAll verification screenshots captured in ./screenshots-v3/');
