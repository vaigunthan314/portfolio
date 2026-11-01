import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUT_DIR = './screenshots-v6';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function runVerification() {
  console.log('=== 1. Testing Audio Autoplay in Headless Chromium ===');

  // Test 1A: Default Autoplay Policy
  console.log('\n[Test 1A: Default Autoplay Policy]');
  const browserDefault = await chromium.launch({
    headless: true,
    args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
  });
  const pageDefault = await browserDefault.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDefault.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await pageDefault.waitForTimeout(600);

  // Capture loader with audio button
  const loaderSS = path.join(OUT_DIR, '01-loader-with-audio-button.png');
  await pageDefault.screenshot({ path: loaderSS });
  console.log(`✓ Captured loader screen with audio button -> ${loaderSS}`);

  const defaultAudioState = await pageDefault.evaluate(() => {
    const audio = document.getElementById('bg-intro-audio');
    const hint = document.body.innerText.includes('CLICK ANYWHERE FOR SOUND');
    const soundBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.innerText.includes('SOUND')
    );
    return {
      audioExists: !!audio,
      paused: audio ? audio.paused : true,
      volume: audio ? audio.volume : 0,
      hintVisible: hint,
      buttonText: soundBtn ? soundBtn.innerText.trim() : null,
    };
  });
  console.log('Result under default policy:', defaultAudioState);
  await browserDefault.close();

  // Test 1B: With --autoplay-policy=no-user-gesture-required
  console.log('\n[Test 1B: With --autoplay-policy=no-user-gesture-required]');
  const browserAutoplay = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
  });
  const pageAutoplay = await browserAutoplay.newPage({ viewport: { width: 1440, height: 900 } });
  await pageAutoplay.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await pageAutoplay.waitForTimeout(1000);

  const autoplayState = await pageAutoplay.evaluate(() => {
    const audio = document.getElementById('bg-intro-audio');
    const soundBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.innerText.includes('SOUND')
    );
    return {
      paused: audio ? audio.paused : true,
      volume: audio ? audio.volume : 0,
      currentTime: audio ? audio.currentTime : 0,
      buttonText: soundBtn ? soundBtn.innerText.trim() : null,
    };
  });
  console.log('Result with no-user-gesture-required:', autoplayState);

  console.log('\n=== 2. Capturing Hero Beats on Desktop (1440x900) ===');
  // Wait for loader dismiss
  await pageAutoplay.waitForTimeout(2500);

  // Scroll 0 (Frame 001)
  await pageAutoplay.evaluate(() => window.scrollTo(0, 0));
  await pageAutoplay.waitForTimeout(500);
  const frame001BrowserPath = path.join(OUT_DIR, '02-frame001-browser-1440x900.png');
  await pageAutoplay.screenshot({ path: frame001BrowserPath });
  console.log(`✓ Captured Frame 001 browser canvas -> ${frame001BrowserPath}`);

  const heroH = await pageAutoplay.evaluate(() => {
    const el = document.getElementById('hero');
    return el ? el.offsetHeight : 4500;
  });

  // Dark beat (Beat 2: I BUILD THINGS THAT SHIP, ~25% of scroll)
  await pageAutoplay.evaluate((h) => window.scrollTo(0, h * 0.25), heroH);
  await pageAutoplay.waitForTimeout(600);
  const darkBeatPath = path.join(OUT_DIR, '03-dark-beat.png');
  await pageAutoplay.screenshot({ path: darkBeatPath });
  console.log(`✓ Captured Dark Beat -> ${darkBeatPath}`);

  // Headphones beat (Beat 3: CLOUD. FULL-STACK. REAL PROJECTS., ~55% of scroll)
  await pageAutoplay.evaluate((h) => window.scrollTo(0, h * 0.55), heroH);
  await pageAutoplay.waitForTimeout(600);
  const headphonesBeatPath = path.join(OUT_DIR, '04-headphones-beat.png');
  await pageAutoplay.screenshot({ path: headphonesBeatPath });
  console.log(`✓ Captured Headphones Beat -> ${headphonesBeatPath}`);

  // Intro beat (Beat 4: ABOUT ME / I AM VAIGUNTHAN SL, ~92% of scroll)
  await pageAutoplay.evaluate((h) => window.scrollTo(0, h * 0.92), heroH);
  await pageAutoplay.waitForTimeout(600);
  const introBeatPath = path.join(OUT_DIR, '05-intro-beat-1440x900.png');
  await pageAutoplay.screenshot({ path: introBeatPath });
  console.log(`✓ Captured Intro Beat (1440x900) -> ${introBeatPath}`);

  // Mobile Intro beat (390x844) to verify no face overlap
  await pageAutoplay.setViewportSize({ width: 390, height: 844 });
  await pageAutoplay.evaluate((h) => window.scrollTo(0, h * 0.92), heroH);
  await pageAutoplay.waitForTimeout(600);
  const mobileIntroPath = path.join(OUT_DIR, '06-intro-beat-mobile-390x844.png');
  await pageAutoplay.screenshot({ path: mobileIntroPath });
  console.log(`✓ Captured Intro Beat Mobile (390x844) -> ${mobileIntroPath}`);

  await browserAutoplay.close();

  console.log('\n=== 3. Quality & Face Zoom Comparison (Source vs Browser) ===');
  const srcFile = './assests/frames-src/ezgif-frame-001.jpg';

  // 3A. Source resized to 1440x810 (contain fit inside 1440x900, top band 45px)
  // Extract face area from source: in 1920x1080, face is roughly x: 800-1120, y: 160-500
  const srcFaceCrop = path.join(OUT_DIR, '07a-source-face-zoom.png');
  await sharp(srcFile)
    .extract({ left: 810, top: 160, width: 300, height: 320 })
    .png()
    .toFile(srcFaceCrop);
  console.log(`✓ Extracted source face zoom -> ${srcFaceCrop}`);

  // 3B. Extract corresponding face area from 1440x900 browser screenshot
  // In 1440x900: scale = 0.75, top margin = 45px
  // x = 810 * 0.75 = 607.5; y = 160 * 0.75 + 45 = 165
  // width = 300 * 0.75 = 225; height = 320 * 0.75 = 240
  const browserFaceCrop = path.join(OUT_DIR, '07b-browser-face-zoom.png');
  await sharp(frame001BrowserPath)
    .extract({ left: 607, top: 165, width: 225, height: 240 })
    .resize(300, 320, { kernel: 'lanczos3' }) // match display size for 1:1 side-by-side
    .png()
    .toFile(browserFaceCrop);
  console.log(`✓ Extracted browser face zoom -> ${browserFaceCrop}`);

  // 3C. Composite side-by-side face comparison
  const comparisonPath = path.join(OUT_DIR, '07c-face-side-by-side-comparison.png');
  const compositeWidth = 640;
  const compositeHeight = 360;

  await sharp({
    create: {
      width: compositeWidth,
      height: compositeHeight,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 },
    },
  })
    .composite([
      { input: srcFaceCrop, top: 20, left: 15 },
      { input: browserFaceCrop, top: 20, left: 325 },
    ])
    .png()
    .toFile(comparisonPath);
  console.log(`✓ Created face comparison image -> ${comparisonPath}`);

  console.log('\nAll verification steps completed successfully!');
}

runVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
