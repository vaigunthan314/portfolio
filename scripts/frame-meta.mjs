import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const framesDir = './public/frames';
const totalFrames = 189;
const rawMeta = [];

console.log(`Sampling frame edges for ${totalFrames} frames...`);

for (let i = 1; i <= totalFrames; i++) {
  const filename = `frame_${String(i).padStart(3, '0')}.png`;
  const filePath = path.join(framesDir, filename);

  const image = sharp(filePath);
  const { width = 1920, height = 1080, channels = 4 } = await image.metadata();

  // Extract raw pixel buffers
  const topBuffer = await sharp(filePath)
    .extract({ left: 0, top: 0, width, height: 8 })
    .raw()
    .toBuffer();

  const bottomBuffer = await sharp(filePath)
    .extract({ left: 0, top: height - 8, width, height: 8 })
    .raw()
    .toBuffer();

  const leftBuffer = await sharp(filePath)
    .extract({ left: 0, top: 0, width: 8, height })
    .raw()
    .toBuffer();

  const rightBuffer = await sharp(filePath)
    .extract({ left: width - 8, top: 0, width: 8, height })
    .raw()
    .toBuffer();

  const getAvg = (buf) => {
    let r = 0, g = 0, b = 0;
    const count = buf.length / channels;
    for (let k = 0; k < buf.length; k += channels) {
      r += buf[k];
      g += buf[k + 1];
      b += buf[k + 2];
    }
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  };

  rawMeta.push({
    top: getAvg(topBuffer),
    bottom: getAvg(bottomBuffer),
    left: getAvg(leftBuffer),
    right: getAvg(rightBuffer),
  });

  if (i % 30 === 0 || i === totalFrames) {
    console.log(`Processed ${i}/${totalFrames} frames`);
  }
}

// Smooth over +/- 3 frames
const smoothed = [];
for (let i = 0; i < rawMeta.length; i++) {
  const start = Math.max(0, i - 3);
  const end = Math.min(rawMeta.length - 1, i + 3);
  const count = end - start + 1;

  const avgSide = (side) => {
    let r = 0, g = 0, b = 0;
    for (let j = start; j <= end; j++) {
      r += rawMeta[j][side][0];
      g += rawMeta[j][side][1];
      b += rawMeta[j][side][2];
    }
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  };

  smoothed.push({
    top: avgSide('top'),
    bottom: avgSide('bottom'),
    left: avgSide('left'),
    right: avgSide('right'),
  });
}

fs.writeFileSync('./public/frames-meta.json', JSON.stringify(smoothed, null, 2));
console.log(`Saved public/frames-meta.json with ${totalFrames} frames edge colors.`);
