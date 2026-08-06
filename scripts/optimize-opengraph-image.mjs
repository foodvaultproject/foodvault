import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const INPUT = path.join("public", "opengraph image", "opengraph-image.png");
const OUTPUT = path.join("src", "app", "opengraph-image.jpg");
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 630;
const TARGET_BYTES = 200 * 1024;
const MIN_QUALITY = 72;

const sourceMeta = await sharp(INPUT).metadata();
const inputStat = await fs.stat(INPUT);
let quality = 86;
let lastBuffer = null;

while (quality >= MIN_QUALITY) {
  lastBuffer = await sharp(INPUT)
    .resize({
      width: OUTPUT_WIDTH,
      height: OUTPUT_HEIGHT,
      fit: "cover",
      withoutEnlargement: true,
    })
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toBuffer();

  if (lastBuffer.length <= TARGET_BYTES) {
    break;
  }

  quality -= 4;
}

if (!lastBuffer) {
  throw new Error("Failed to encode Open Graph image");
}

await fs.writeFile(OUTPUT, lastBuffer);
const outputMeta = await sharp(lastBuffer).metadata();

console.log(
  `opengraph-image: ${sourceMeta.width}x${sourceMeta.height} (${(inputStat.size / 1024).toFixed(1)} KB) -> ${outputMeta.width}x${outputMeta.height} (${(lastBuffer.length / 1024).toFixed(1)} KB, q${quality})`,
);
