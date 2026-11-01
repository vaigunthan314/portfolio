import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DESKTOP = path.join(__dirname, '../screenshots-v4/desktop');
const OUT_MOBILE = path.join(__dirname, '../screenshots-v4/mobile');
mkdirSync(OUT_DESKTOP, { recursive: true });
mkdirSync(OUT_MOBILE, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function runDesktop() {
  console.log('\n--- Running Desktop Tests (1440x900) ---');
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Loader
  await page.goto('http://localhost:3000', { waitUntil: 'commit' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DESKTOP, '01-loader-letter-by-letter.png') });
  console.log('✓ 01-loader-letter-by-letter.png');

  // Wait for loader to wipe away
  await page.waitForTimeout(2800);
  await page.screenshot({ path: path.join(OUT_DESKTOP, '02-hero-start.png') });
  console.log('✓ 02-hero-start.png');

  // Helper for scrolling hero wrapper
  const heroWrapper = await page.$('.hero-pinned-wrapper');
  const heroBox = await heroWrapper.boundingBox();
  const maxHeroScroll = heroBox.height - 900;

  async function shotHero(progress, filename) {
    const targetY = heroBox.y + maxHeroScroll * progress;
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT_DESKTOP, filename) });
    console.log(`✓ ${filename}`);
  }

  // Beat 2: frames 40-100 (around 24% scroll)
  await shotHero(0.24, '03-hero-beat2-ibuild.png');

  // Beat 3: headphones frames 100-180 (around 55% scroll)
  await shotHero(0.55, '04-hero-beat3-headphones.png');

  // Final Beat: Intro beside image (around 88% scroll)
  await shotHero(0.88, '05-hero-beat4-intro-beside-image.png');

  // Helper for scrolling skills section (250vh pinned)
  const skillsSec = await page.$('#skills');
  const skillsBox = await skillsSec.boundingBox();
  const maxSkillsScroll = skillsBox.height - 900;

  async function shotSkills(progress, filename) {
    const targetY = skillsBox.y + maxSkillsScroll * progress;
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT_DESKTOP, filename) });
    console.log(`✓ ${filename}`);
  }

  await shotSkills(0.05, '06-skills-tree-00pct.png');
  await shotSkills(0.25, '07-skills-tree-25pct.png');
  await shotSkills(0.50, '08-skills-tree-50pct.png');
  await shotSkills(0.75, '09-skills-tree-75pct.png');
  await shotSkills(0.98, '10-skills-tree-100pct.png');

  // Other sections
  async function shotSection(id, filename) {
    const el = await page.$(id);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT_DESKTOP, filename) });
      console.log(`✓ ${filename}`);
    }
  }

  await shotSection('#experience', '11-experience-compact.png');
  await shotSection('#projects', '12-projects-compact.png');
  await shotSection('#education', '13-education-compact.png');
  await shotSection('#contact', '14-contact-compact.png');

  // /malaysia page
  await page.goto('http://localhost:3000/malaysia', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DESKTOP, '15-malaysia-page.png') });
  console.log('✓ 15-malaysia-page.png');

  await page.close();
}

async function runMobile() {
  console.log('\n--- Running Mobile Tests (390x844) ---');
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:3000', { waitUntil: 'commit' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_MOBILE, '01-mobile-loader.png') });
  console.log('✓ 01-mobile-loader.png');

  await page.waitForTimeout(2800);
  await page.screenshot({ path: path.join(OUT_MOBILE, '02-mobile-hero-start.png') });
  console.log('✓ 02-mobile-hero-start.png');

  const heroWrapper = await page.$('.hero-pinned-wrapper');
  const heroBox = await heroWrapper.boundingBox();
  const maxHeroScroll = heroBox.height - 844;

  async function shotHero(progress, filename) {
    const targetY = heroBox.y + maxHeroScroll * progress;
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT_MOBILE, filename) });
    console.log(`✓ ${filename}`);
  }

  await shotHero(0.24, '03-mobile-beat2.png');
  await shotHero(0.55, '04-mobile-beat3-headphones.png');
  await shotHero(0.88, '05-mobile-intro.png');

  const skillsSec = await page.$('#skills');
  const skillsBox = await skillsSec.boundingBox();
  const maxSkillsScroll = skillsBox.height - 844;

  async function shotSkills(progress, filename) {
    const targetY = skillsBox.y + maxSkillsScroll * progress;
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT_MOBILE, filename) });
    console.log(`✓ ${filename}`);
  }

  await shotSkills(0.50, '06-mobile-skills-tree.png');

  async function shotSection(id, filename) {
    const el = await page.$(id);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT_MOBILE, filename) });
      console.log(`✓ ${filename}`);
    }
  }

  await shotSection('#projects', '07-mobile-projects.png');
  await shotSection('#education', '08-mobile-education.png');

  await page.close();
}

await runDesktop();
await runMobile();
await browser.close();
console.log('\nAll desktop and mobile screenshots verified!');
