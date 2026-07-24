import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Per-asset budget tuned for fast LCP while keeping hero visuals crisp on retina. */
const TARGET_BYTES = 200 * 1024;
const publicHome = path.join(process.cwd(), "public", "home");

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
  inputName: "kiwi_piggy_hp.png",
  outputName: "kiwi_piggy_hp.webp",
  resize: { height: 960, withoutEnlargement: true },
  label: "Kiwi illustration",
  targetBytes: 180 * 1024,
});

await writeWebpUnderTarget({
  inputName: "hero-visitor-background.png",
  outputName: "hero-visitor-background.webp",
  resize: { width: 1920, withoutEnlargement: true },
  label: "Visitor hero background",
  targetBytes: 120 * 1024,
});
