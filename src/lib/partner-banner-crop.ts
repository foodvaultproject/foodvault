export type BannerCropSettings = {
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

export const BANNER_ASPECT = 3 / 1;
export const BANNER_OUTPUT_WIDTH = 1800;
export const BANNER_OUTPUT_HEIGHT = 600;

export const DEFAULT_BANNER_CROP: BannerCropSettings = {
  zoom: 1,
  x: 0,
  y: 0,
};

export function parseBannerCrop(value: unknown): BannerCropSettings | null {
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

/** Render a 3:1 JPEG from the crop area (1800×600 display asset). */
export async function getCroppedBannerBlob(
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

  outputCanvas.width = BANNER_OUTPUT_WIDTH;
  outputCanvas.height = BANNER_OUTPUT_HEIGHT;

  outputCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    BANNER_OUTPUT_WIDTH,
    BANNER_OUTPUT_HEIGHT
  );

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Banner crop export failed."));
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
