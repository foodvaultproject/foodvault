import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Per-asset budget tuned for fast LCP while keeping hero visuals crisp on retina. */
const TARGET_BYTES = 180 * 1024;
const publicHome = path.join(process.cwd(), "public", "home hero active member");

async function writeWebpUnderTarget({
  inputName,
  outputName,
  resize,
  label,
  targetBytes = TARGET_BYTES,
}) {
  const inputPath = path.join(publicHome, inputName);
  const outputPath = path.join(publicHome, outputName);
  const sourceMeta = await sharp(inputPath).metadata();
  let quality = 84;
  let lastBuffer = null;

  while (quality >= 40) {
    lastBuffer = await sharp(inputPath)
      .trim({ threshold: 8 })
      .resize(resize)
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();

    if (lastBuffer.length <= targetBytes) {
      break;
    }

    quality -= 4;
  }

  if (!lastBuffer) {
    throw new Error(`Failed to encode ${label}`);
  }

  const outputMeta = await sharp(lastBuffer).metadata();
  await fs.writeFile(outputPath, lastBuffer);

  console.log(
    `${label}: ${sourceMeta.width}x${sourceMeta.height} -> ${outputMeta.width}x${outputMeta.height}, ${(lastBuffer.length / 1024).toFixed(1)} KB (q${quality}) -> ${outputName}`
  );
}

await writeWebpUnderTarget({
  inputName: "piggy_active_hero.png",
  outputName: "piggy_active_hero.webp",
  resize: { width: 1400, withoutEnlargement: true },
  label: "Active member hero illustration",
  targetBytes: 180 * 1024,
});
