import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicHowItWorks = path.join(process.cwd(), "public", "how-it-works");

async function writeWebpUnderTarget({
  inputName,
  outputName,
  resize,
  label,
  targetBytes,
}) {
  const inputPath = path.join(publicHowItWorks, inputName);
  const outputPath = path.join(publicHowItWorks, outputName);
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
  inputName: "how-it-works-hero-image.png",
  outputName: "how-it-works-hero-image.webp",
  resize: { height: 960, withoutEnlargement: true },
  label: "How it works hero illustration",
  targetBytes: 180 * 1024,
});

await writeWebpUnderTarget({
  inputName: "how-it-works-hero-bg.png",
  outputName: "how-it-works-hero-bg.webp",
  resize: { width: 1920, withoutEnlargement: true },
  label: "How it works hero background",
  targetBytes: 120 * 1024,
});
