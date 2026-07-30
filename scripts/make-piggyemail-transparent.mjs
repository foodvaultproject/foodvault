import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const input = path.join(process.cwd(), "public", "verify email", "piggyemail.png");
const outDir = path.join(process.cwd(), "public", "verify-email");

async function removeWhiteBackground(inputPath, threshold = 242) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const avg = (r + g + b) / 3;

    if (avg >= threshold) {
      data[i + 3] = 0;
    } else if (avg >= threshold - 18) {
      data[i + 3] = Math.round(((threshold - avg) / 18) * 255);
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

await fs.mkdir(outDir, { recursive: true });
const processed = await removeWhiteBackground(input);
const pngPath = path.join(outDir, "piggyemail.png");
const webpPath = path.join(outDir, "piggyemail.webp");

await processed.clone().png({ compressionLevel: 9 }).toFile(pngPath);
await processed.clone().webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(webpPath);

const meta = await sharp(pngPath).metadata();
console.log(
  `Wrote ${pngPath} and ${webpPath} (${meta.width}x${meta.height}, hasAlpha=${meta.hasAlpha})`
);
