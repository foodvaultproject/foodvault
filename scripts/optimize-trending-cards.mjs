import sharp from "sharp";
import fs from "fs";
import path from "path";

const srcDir = path.join("public", "trending homepage");
const outDir = path.join("public", "trending-homepage");
const DESKTOP_CARD_ASPECT_WIDTH = 8;
const DESKTOP_CARD_ASPECT_HEIGHT = 3;
const OUTPUT_WIDTH = 960;
const WEBP_QUALITY = 82;

/** Source PNGs include a white strip on the right edge that must be cropped off. */
const RIGHT_EDGE_CROP_RATIO = {
  "drinks-hp.png": 0.9768,
};

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".png"));

for (const file of files) {
  const input = path.join(srcDir, file);
  const base = file.replace(/\.png$/i, "");
  const slugBase =
    base === "Beer, Wine & Liquor-hp" ? "beer-wine-liquor-hp" : base;
  const output = path.join(outDir, `${slugBase}.webp`);
  const cropRatio = RIGHT_EDGE_CROP_RATIO[file] ?? 1;

  const meta = await sharp(input).metadata();
  const inputSize = fs.statSync(input).size;
  const cropWidth = Math.floor(meta.width * cropRatio);

  await sharp(input)
    .rotate()
    .extract({ left: 0, top: 0, width: cropWidth, height: meta.height })
    .resize({
      width: OUTPUT_WIDTH,
      height: Math.round(
        (OUTPUT_WIDTH * DESKTOP_CARD_ASPECT_HEIGHT) / DESKTOP_CARD_ASPECT_WIDTH
      ),
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(output);

  const outputSize = fs.statSync(output).size;
  const outMeta = await sharp(output).metadata();

  console.log(
    `${base}: ${meta.width}x${meta.height} (${(inputSize / 1024 / 1024).toFixed(1)} MB) -> ${outMeta.width}x${outMeta.height} (${(outputSize / 1024).toFixed(1)} KB)`,
  );
}
