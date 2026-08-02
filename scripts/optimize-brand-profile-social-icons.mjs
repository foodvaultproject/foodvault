import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ICON_SIZE = 164;
const WEBP_QUALITY = 82;
const srcDir = path.join("public", "brand profile");

const files = (await fs.readdir(srcDir)).filter((file) => file.endsWith(".png"));

for (const file of files) {
  const inputPath = path.join(srcDir, file);
  const outputPath = path.join(srcDir, file.replace(/\.png$/i, ".webp"));
  const inputStat = await fs.stat(inputPath);
  const meta = await sharp(inputPath).metadata();

  await sharp(inputPath)
    .resize(ICON_SIZE, ICON_SIZE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6, smartSubsample: true })
    .toFile(outputPath);

  const outputStat = await fs.stat(outputPath);
  const outMeta = await sharp(outputPath).metadata();

  console.log(
    `${file}: ${meta.width}x${meta.height} (${(inputStat.size / 1024).toFixed(1)} KB) -> ${outMeta.width}x${outMeta.height} (${(outputStat.size / 1024).toFixed(1)} KB)`,
  );
}
