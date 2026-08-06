import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const INPUT = path.join("public", "homepage banner 3", "banner-3.png");
const OUTPUT = path.join("public", "homepage banner 3", "banner-3.webp");
const OUTPUT_WIDTH = 1920;
const TARGET_BYTES = 180 * 1024;
const MIN_QUALITY = 70;

const sourceMeta = await sharp(INPUT).metadata();
const inputStat = await fs.stat(INPUT);
let quality = 84;
let lastBuffer = null;

while (quality >= MIN_QUALITY) {
  lastBuffer = await sharp(INPUT)
    .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();

  if (lastBuffer.length <= TARGET_BYTES) {
    break;
  }

  quality -= 4;
}

if (!lastBuffer) {
  throw new Error("Failed to encode homepage banner 3");
}

await fs.writeFile(OUTPUT, lastBuffer);
const outputMeta = await sharp(lastBuffer).metadata();

console.log(
  `banner-3: ${sourceMeta.width}x${sourceMeta.height} (${(inputStat.size / 1024 / 1024).toFixed(1)} MB) -> ${outputMeta.width}x${outputMeta.height} (${(lastBuffer.length / 1024).toFixed(1)} KB, q${quality})`,
);
