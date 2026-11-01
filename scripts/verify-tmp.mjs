import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUT_DIR = '/tmp/portfolio-shots';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function verifyAll() {
  console.log('=== TEST 1: Audio in Standard Headless Chromium (Default Autoplay Policy) ===');
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
  console.log(`✓ Saved loader with audio button -> ${loaderSS}`);

  const defaultState = await pageDefault.evaluate(() => {
    const audio = document.getElementById('bg-intro-audio');
    const hint = document.body.innerText.includes('CLICK ANYWHERE FOR SOUND');
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('SOUND'));
    return {
      audioExists: !!audio,
      paused: audio ? audio.paused : true,
      volume: audio ? audio.volume : 0,
      hintVisible: hint,
      buttonText: btn ? btn.innerText.trim() : null,
    };
  });
  console.log('Default policy on load:', defaultState);
  await browserDefault.close();

  console.log('\n=== TEST 2: Audio with --autoplay-policy=no-user-gesture-required ===');
  const browserAutoplay = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
  });
  const pageAutoplay = await browserAutoplay.newPage({ viewport: { width: 1440, height: 900 } });
  await pageAutoplay.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await pageAutoplay.waitForTimeout(1000);

  const initialAutoplayState = await pageAutoplay.evaluate(() => {
    const audio = document.getElementById('bg-intro-audio');
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('SOUND'));
    return {
      paused: audio ? audio.paused : true,
      volume: audio ? audio.volume : 0,
      currentTime: audio ? audio.currentTime : 0,
      buttonText: btn ? btn.innerText.trim() : null,
    };
  });
  console.log('Autoplay state during loader:', initialAutoplayState);

  // Wait for loader to finish and slide away (3 seconds total)
  console.log('Waiting for loader to dismiss...');
  await pageAutoplay.waitForTimeout(2500);

  // Check if audio keeps playing after loader ends
  const afterLoaderState = await pageAutoplay.evaluate(() => {
    const audio = document.getElementById('bg-intro-audio');
    return {
      paused: audio ? audio.paused : true,
      volume: audio ? audio.volume : 0,
      currentTime: audio ? audio.currentTime : 0,
    };
  });
  console.log('Audio state AFTER loader dismisses:', afterLoaderState);

  // Test if SOUND OFF button stops audio
  console.log('Testing SOUND OFF toggle...');
  await pageAutoplay.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('SOUND'));
    if (btn) btn.click();
  });
  await pageAutoplay.waitForTimeout(500);

  const afterMuteState = await pageAutoplay.evaluate(() => {
    const audio = document.getElementById('bg-intro-audio');
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('SOUND'));
    return {
      paused: audio ? audio.paused : true,
      buttonText: btn ? btn.innerText.trim() : null,
    };
  });
  console.log('Audio state AFTER clicking SOUND OFF:', afterMuteState);

  // Resume sound (toggle back ON)
  await pageAutoplay.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('SOUND'));
    if (btn) btn.click();
  });
  await pageAutoplay.waitForTimeout(500);

  const afterResumeState = await pageAutoplay.evaluate(() => {
    const audio = document.getElementById('bg-intro-audio');
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('SOUND'));
    return {
      paused: audio ? audio.paused : true,
      buttonText: btn ? btn.innerText.trim() : null,
    };
  });
  console.log('Audio state AFTER toggling back ON:', afterResumeState);

  console.log('\n=== TEST 3: Capturing Hero Beats on Desktop (1440x900) ===');
  // Scroll 0 (Frame 001)
  await pageAutoplay.evaluate(() => window.scrollTo(0, 0));
  await pageAutoplay.waitForTimeout(500);
  const frame001BrowserPath = path.join(OUT_DIR, '02-frame001-browser-1440x900.png');
  await pageAutoplay.screenshot({ path: frame001BrowserPath });
  console.log(`✓ Saved Frame 001 browser screenshot -> ${frame001BrowserPath}`);

  const heroH = await pageAutoplay.evaluate(() => {
    const el = document.getElementById('hero');
    return el ? el.offsetHeight : 4500;
  });

  // Dark beat (Beat 2: I BUILD THINGS THAT SHIP, ~25% scroll)
  await pageAutoplay.evaluate((h) => window.scrollTo(0, h * 0.25), heroH);
  await pageAutoplay.waitForTimeout(600);
  const darkBeatPath = path.join(OUT_DIR, '03-dark-beat.png');
  await pageAutoplay.screenshot({ path: darkBeatPath });
  console.log(`✓ Saved Dark Beat -> ${darkBeatPath}`);

  // Headphones beat (Beat 3: CLOUD. FULL-STACK. REAL PROJECTS., ~55% scroll)
  await pageAutoplay.evaluate((h) => window.scrollTo(0, h * 0.55), heroH);
  await pageAutoplay.waitForTimeout(600);
  const headphonesBeatPath = path.join(OUT_DIR, '04-headphones-beat.png');
  await pageAutoplay.screenshot({ path: headphonesBeatPath });
  console.log(`✓ Saved Headphones Beat -> ${headphonesBeatPath}`);

  // Intro beat (Beat 4: ABOUT ME / I AM VAIGUNTHAN SL, ~90% scroll)
  await pageAutoplay.evaluate((h) => window.scrollTo(0, h * 0.90), heroH);
  await pageAutoplay.waitForTimeout(600);
  const introBeatPath = path.join(OUT_DIR, '05-intro-beat-1440x900.png');
  await pageAutoplay.screenshot({ path: introBeatPath });
  console.log(`✓ Saved Intro Beat (1440x900) -> ${introBeatPath}`);

  await browserAutoplay.close();

  console.log('\n=== TEST 4: Frame 001 Beside Source Comparison ===');
  const srcFile = '/Users/vaigunthansl/Desktop/portfolio/assests/frames/frame_001.png';

  // Scale original 1920x1080 source to 700x394
  const srcThumb = await sharp(srcFile)
    .resize(700, 394, { fit: 'contain', background: { r: 249, g: 249, b: 248, alpha: 1 } })
    .png()
    .toBuffer();

  const browserThumb = await sharp(frame001BrowserPath)
    .resize(700, 437)
    .png()
    .toBuffer();

  const fullSideBySidePath = path.join(OUT_DIR, '06-frame001-beside-source.png');
  await sharp({
    create: {
      width: 1440,
      height: 480,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 },
    },
  })
    .composite([
      { input: srcThumb, top: 20, left: 15 },
      { input: browserThumb, top: 20, left: 725 },
    ])
    .png()
    .toFile(fullSideBySidePath);

  console.log(`✓ Created full Frame 001 beside source comparison -> ${fullSideBySidePath}`);

  console.log('\nAll verification tests completed successfully!');
}

verifyAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
