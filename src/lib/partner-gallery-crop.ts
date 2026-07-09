export type GalleryCropSettings = {
  zoom: number;
  x: number;
  y: number;
};

export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const GALLERY_ASPECT = 4 / 5;
export const GALLERY_OUTPUT_WIDTH = 1080;
export const GALLERY_OUTPUT_HEIGHT = 1350;

export const DEFAULT_GALLERY_CROP: GalleryCropSettings = {
  zoom: 1,
  x: 0,
  y: 0,
};

export function parseGalleryCrop(value: unknown): GalleryCropSettings | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const zoom = Number(row.zoom);
  const x = Number(row.x);
  const y = Number(row.y);
  if (!Number.isFinite(zoom) || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return { zoom, x, y };
}

export function parseGalleryImageCrops(value: unknown): GalleryCropSettings[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => parseGalleryCrop(entry))
    .filter((entry): entry is GalleryCropSettings => entry !== null);
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width + Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width + Math.cos(rotRad) * height),
  };
}

/** Render a 4:5 JPEG from the crop area (1080×1350 display asset). */
export async function getCroppedGalleryBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create canvas context.");
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const outputCanvas = document.createElement("canvas");
  const outputCtx = outputCanvas.getContext("2d");

  if (!outputCtx) {
    throw new Error("Unable to create output canvas context.");
  }

  outputCanvas.width = GALLERY_OUTPUT_WIDTH;
  outputCanvas.height = GALLERY_OUTPUT_HEIGHT;

  outputCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    GALLERY_OUTPUT_WIDTH,
    GALLERY_OUTPUT_HEIGHT
  );

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gallery crop export failed."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });
}

export function revokeIfBlobUrl(url: string | undefined) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
