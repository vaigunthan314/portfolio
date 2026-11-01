import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC_DIR = join(ROOT, 'assests', 'frames-src');
const OUT_DIR = join(ROOT, 'public', 'frames');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const files = readdirSync(SRC_DIR)
  .filter(f => /^ezgif-frame-\d+\.jpg$/i.test(f))
  .sort();

console.log(`Found ${files.length} source frames.`);

const BATCH = 10;

for (let i = 0; i < files.length; i += BATCH) {
  const batch = files.slice(i, i + BATCH);
  await Promise.all(
    batch.map(async (file) => {
      const num = file.match(/(\d+)/)[1];
      const padded = num.padStart(4, '0');
      const outPath = join(OUT_DIR, `frame-${padded}.webp`);

      await sharp(join(SRC_DIR, file))
        .resize({ width: 1280 })
        .webp({ quality: 70 })
        .toFile(outPath);
    })
  );
  const done = Math.min(i + BATCH, files.length);
  process.stdout.write(`\r  Converted ${done}/${files.length} frames`);
}

console.log('\n✓ All frames converted to WebP.');
