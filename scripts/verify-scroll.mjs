import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const outDir = resolve(import.meta.dirname, '..', 'tests', 'screenshots');
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

async function verify() {
  console.log('Launching Chromium for screenshot verification...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for loader to fade out (max 3 seconds)
  await page.waitForTimeout(2000);

  const getScrollPositions = async () => {
    return await page.evaluate(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      return { maxScroll, docHeight: document.documentElement.scrollHeight };
    });
  };

  const { maxScroll, docHeight } = await getScrollPositions();
  console.log(`Document height: ${docHeight}px, max scrollable: ${maxScroll}px`);

  // Helper to scroll to percentage and wait for animations
  const scrollToPct = async (pct, name) => {
    const targetY = Math.round((pct / 100) * maxScroll);
    console.log(`Scrolling to ${pct}% (${targetY}px)...`);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);
    await page.waitForTimeout(800); // let GSAP / Lenis settle
    const filepath = `${outDir}/${name}.png`;
    await page.screenshot({ path: filepath });
    console.log(`Saved screenshot: ${filepath}`);
  };

  // 1. Scroll 0% (Hero initial frame + overlays)
  await scrollToPct(0, '01-scroll-000-top');

  // 2. Scroll 10%
  await scrollToPct(10, '02-scroll-010');

  // 3. Scroll 30%
  await scrollToPct(30, '03-scroll-030');

  // 4. Scroll 50%
  await scrollToPct(50, '04-scroll-050');

  // 5. Scroll 70%
  await scrollToPct(70, '05-scroll-070');

  // 6. Scroll 100%
  await scrollToPct(100, '06-scroll-100');

  // 7. Scroll back to Top 0%
  await scrollToPct(0, '07-scroll-back-top');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
