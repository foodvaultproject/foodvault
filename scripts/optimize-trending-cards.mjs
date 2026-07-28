import sharp from "sharp";
import fs from "fs";
import path from "path";

const srcDir = path.join("public", "trending homepage");
const outDir = path.join("public", "trending-homepage");
const MAX_WIDTH = 640;
const WEBP_QUALITY = 82;

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".png"));

for (const file of files) {
  const input = path.join(srcDir, file);
  const base = file.replace(/\.png$/i, "");
  const slugBase =
    base === "Beer, Wine & Liquor-hp" ? "beer-wine-liquor-hp" : base;
  const output = path.join(outDir, `${slugBase}.webp`);

  const meta = await sharp(input).metadata();
  const inputSize = fs.statSync(input).size;

  await sharp(input)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(output);

  const outputSize = fs.statSync(output).size;
  const outMeta = await sharp(output).metadata();

  console.log(
    `${base}: ${meta.width}x${meta.height} (${(inputSize / 1024 / 1024).toFixed(1)} MB) -> ${outMeta.width}x${outMeta.height} (${(outputSize / 1024).toFixed(1)} KB)`,
  );
}
