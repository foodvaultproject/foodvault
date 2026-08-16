import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicCards = path.join(process.cwd(), "public", "active member cards");
const OUTPUT_WIDTH = 960;
const TARGET_BYTES = 60 * 1024;
const MIN_QUALITY = 70;

const files = [
  "browse_brands_card.png",
  "membership_card.png",
  "favourites_card.png",
  "account_card.png",
];

for (const inputName of files) {
  const inputPath = path.join(publicCards, inputName);
  const outputName = inputName.replace(/\.png$/i, ".webp");
  const outputPath = path.join(publicCards, outputName);
  const sourceMeta = await sharp(inputPath).metadata();
  const inputStat = await fs.stat(inputPath);
  let quality = 84;
  let lastBuffer = null;

  while (quality >= MIN_QUALITY) {
    lastBuffer = await sharp(inputPath)
      .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();

    if (lastBuffer.length <= TARGET_BYTES) {
      break;
    }

    quality -= 4;
  }

  if (!lastBuffer) {
    throw new Error(`Failed to encode ${inputName}`);
  }

  await fs.writeFile(outputPath, lastBuffer);
  const outputMeta = await sharp(lastBuffer).metadata();

  console.log(
    `${inputName}: ${sourceMeta.width}x${sourceMeta.height} (${(inputStat.size / 1024).toFixed(1)} KB) -> ${outputMeta.width}x${outputMeta.height} (${(lastBuffer.length / 1024).toFixed(1)} KB, q${quality}) -> ${outputName}`
  );
}
