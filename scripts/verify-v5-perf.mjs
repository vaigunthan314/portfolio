import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = './screenshots-v5';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function runTests() {
  console.log('--- Launching Playwright Chromium (Default Autoplay Policy) ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Test 1: Check audio autoplay on page load in standard headless Chromium
  console.log('Checking audio autoplay status on load...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const audioStatus = await page.evaluate(() => {
    const audio = document.getElementById('bg-intro-audio');
    const hint = document.body.innerText.includes('CLICK ANYWHERE FOR SOUND');
    return {
      exists: !!audio,
      paused: audio ? audio.paused : true,
      volume: audio ? audio.volume : 0,
      muted: audio ? audio.muted : false,
      currentTime: audio ? audio.currentTime : 0,
      hintVisible: hint,
    };
  });

  console.log('Audio Autoplay Status on initial load:', audioStatus);

  // If paused, simulate pointerdown to test interaction trigger
  if (audioStatus.paused) {
    console.log('Triggering click on body to test interaction audio start...');
    await page.click('body');
    await page.waitForTimeout(1000);
    const afterClick = await page.evaluate(() => {
      const audio = document.getElementById('bg-intro-audio');
      return {
        paused: audio ? audio.paused : true,
        volume: audio ? audio.volume : 0,
        currentTime: audio ? audio.currentTime : 0,
      };
    });
    console.log('Audio Status after click:', afterClick);
  }

  // Wait for loader to finish dismiss (min 2.5s)
  await page.waitForTimeout(3000);

  // Test 2: Hero scroll 0 on 3 viewports: 1440x900, 1920x1080, 2880x1800
  const viewports = [
    { name: '1440x900', w: 1440, h: 900 },
    { name: '1920x1080', w: 1920, h: 1080 },
    { name: '2880x1800', w: 2880, h: 1800 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const ssPath = path.join(OUT_DIR, `01-hero-scroll0-${vp.name}.png`);
    await page.screenshot({ path: ssPath });
    console.log(`✓ Captured scroll 0 on ${vp.name} -> ${ssPath}`);
  }

  // Reset viewport to standard 1440x900
  await page.setViewportSize({ width: 1440, height: 900 });

  // Test 3: Dark beat (scroll to ~25% and ~50% of hero)
  const heroWrapperH = await page.evaluate(() => {
    const el = document.getElementById('hero');
    return el ? el.offsetHeight : 4500;
  });

  console.log(`Hero wrapper height: ${heroWrapperH}px`);

  // Dark beat: scroll to ~30% of hero
  await page.evaluate((h) => window.scrollTo(0, h * 0.25), heroWrapperH);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '02-hero-dark-beat.png') });
  console.log('✓ Captured 02-hero-dark-beat.png');

  // Dark beat 2 (headphones scene): scroll to ~55% of hero
  await page.evaluate((h) => window.scrollTo(0, h * 0.55), heroWrapperH);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '03-hero-headphones-beat.png') });
  console.log('✓ Captured 03-hero-headphones-beat.png');

  // Intro beat: final ~15% of hero (~90% scroll)
  await page.evaluate((h) => window.scrollTo(0, h * 0.92), heroWrapperH);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, '04-hero-intro-beat.png') });
  console.log('✓ Captured 04-hero-intro-beat.png');

  // Last frame position right at end of hero
  await page.evaluate((h) => window.scrollTo(0, h * 0.99), heroWrapperH);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '05-hero-last-frame.png') });
  console.log('✓ Captured 05-hero-last-frame.png');

  // Test 4: Malaysia page
  console.log('Navigating to /malaysia...');
  await page.goto('http://localhost:3000/malaysia', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '06-malaysia-first-screen.png') });
  console.log('✓ Captured 06-malaysia-first-screen.png (1440x900)');

  // Test 5: Performance metrics measurement via CDP
  console.log('\n--- Measuring Performance Metrics via CDP ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 900 });
  // Wait for loader dismiss
  await page.waitForTimeout(3000);

  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');

  // Setup Long Tasks observer in browser
  await page.evaluate(() => {
    window.__longTasks = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          window.__longTasks.push(entry.duration);
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  });

  // Smooth scroll through entire hero over ~4 seconds while measuring FPS
  console.log('Scrubbing steadily through the hero...');
  const perfData = await page.evaluate(async (totalH) => {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      const scrollDuration = 3500; // 3.5 seconds

      function step(now) {
        frameCount++;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / scrollDuration);
        window.scrollTo(0, progress * totalH);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          const totalDuration = performance.now() - startTime;
          const avgFps = Math.round((frameCount / (totalDuration / 1000)) * 10) / 10;
          resolve({
            avgFps,
            totalDuration,
            frameCount,
            longTasks: window.__longTasks || [],
          });
        }
      }

      requestAnimationFrame(step);
    });
  }, heroWrapperH);

  // Get JS Heap from CDP
  const cdpMetrics = await client.send('Performance.getMetrics');
  let jsHeapUsedMB = 0;
  for (const m of cdpMetrics.metrics) {
    if (m.name === 'JSHeapUsedSize') {
      jsHeapUsedMB = Math.round((m.value / (1024 * 1024)) * 10) / 10;
    }
  }

  console.log('=== Performance Results ===');
  console.log(`Average FPS: ${perfData.avgFps} fps (Target: >= 50 fps)`);
  console.log(`Long Tasks (> 100ms): ${perfData.longTasks.length} tasks (Target: 0)`);
  if (perfData.longTasks.length > 0) {
    console.log(`  Durations: ${perfData.longTasks.join(', ')} ms`);
  }
  console.log(`Peak JS Heap: ${jsHeapUsedMB} MB (Target: < 500 MB)`);

  await browser.close();
  console.log('\nAll tests and screenshots completed successfully!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
