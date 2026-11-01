import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_DIR = './assests/frames-src';
const FG_DIR = './public/frames-fg';
const HD_DIR = './public/frames-hd';
const MASK_DIR = './public/frames-mask';

fs.mkdirSync(HD_DIR, { recursive: true });
fs.mkdirSync(MASK_DIR, { recursive: true });

async function run() {
  console.log('--- Generating HD 1920px frames into public/frames-hd and masks into public/frames-mask ---');
  
  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.startsWith('ezgif-frame-') && f.endsWith('.jpg'))
    .sort();

  console.log(`Found ${files.length} frames.`);

  // 1. Generate HD 1920px WebP frames (quality 82)
  console.log('Generating HD 1920px WebP frames...');
  const hdTasks = files.map((file, idx) => {
    const frameNum = String(idx + 1).padStart(4, '0');
    const outPath = path.join(HD_DIR, `frame-${frameNum}.webp`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) return Promise.resolve();

    return sharp(path.join(SRC_DIR, file))
      .resize(1920)
      .webp({ quality: 82 })
      .toFile(outPath);
  });

  await Promise.all(hdTasks);
  console.log('✓ All HD frames generated.');

  // 2. Generate alpha masks from public/frames-fg
  console.log('Generating alpha masks from foreground cutouts...');
  const maskTasks = Array.from({ length: 236 }, (_, i) => {
    const frameNum = String(i + 1).padStart(4, '0');
    const fgPath = path.join(FG_DIR, `frame-${frameNum}.webp`);
    const maskPath = path.join(MASK_DIR, `frame-${frameNum}.png`);

    if (fs.existsSync(maskPath) && fs.statSync(maskPath).size > 500) return Promise.resolve();
    if (!fs.existsSync(fgPath)) {
      console.warn(`Missing FG cutout for ${fgPath}`);
      return Promise.resolve();
    }

    // Extract alpha channel (channel 3) and apply 1px blur for soft edge
    return sharp(fgPath)
      .extractChannel(3)
      .blur(1)
      .png({ compressionLevel: 6 })
      .toFile(maskPath);
  });

  await Promise.all(maskTasks);
  console.log('✓ All alpha masks generated.');
  console.log('Done!');
}

run().catch(console.error);
