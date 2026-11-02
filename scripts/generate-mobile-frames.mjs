import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SRC_DIR = path.join(ROOT, 'assests', 'frames');
const OUT_DIR = path.join(ROOT, 'public', 'frames-mobile');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const files = fs.readdirSync(SRC_DIR)
  .filter(f => /^frame_\d+\.png$/i.test(f))
  .sort();

console.log(`Found ${files.length} original frames in ${SRC_DIR}.`);

const BATCH_SIZE = 10;
let totalSize = 0;

for (let i = 0; i < files.length; i += BATCH_SIZE) {
  const batch = files.slice(i, i + BATCH_SIZE);
  await Promise.all(
    batch.map(async (file) => {
      const numMatch = file.match(/frame_(\d+)\.png/i);
      if (!numMatch) return;
      const num = numMatch[1];
      const outName = `frame_${num}.jpg`;
      const outPath = path.join(OUT_DIR, outName);

      const info = await sharp(path.join(SRC_DIR, file))
        .resize({ width: 1080, withoutEnlargement: true })
        .jpeg({ quality: 90, mozjpeg: true })
        .toFile(outPath);

      totalSize += info.size;
    })
  );
  process.stdout.write(`\rConverted ${Math.min(i + BATCH_SIZE, files.length)} / ${files.length} frames...`);
}

const mb = (totalSize / (1024 * 1024)).toFixed(2);
console.log(`\n✓ Successfully generated ${files.length} mobile frames in public/frames-mobile.`);
console.log(`Total mobile size: ${mb} MB (avg ${(totalSize / files.length / 1024).toFixed(1)} KB per frame)`);
