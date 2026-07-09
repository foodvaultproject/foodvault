import type { CSSProperties } from "react";

export type LogoCropSettings = {
  zoom: number;
  x: number;
  y: number;
  /** Percentage crop area from react-easy-crop; used to restore the editor accurately. */
  areaPercent?: Area;
};

export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Canonical export size for the circular logo avatar stored in logo_url. */
export const LOGO_AVATAR_EXPORT_SIZE = 512;

export const DEFAULT_LOGO_CROP: LogoCropSettings = {
  zoom: 1,
  x: 0,
  y: 0,
};

function parseArea(value: unknown): Area | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  const x = Number(row.x);
  const y = Number(row.y);
  const width = Number(row.width);
  const height = Number(row.height);
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return undefined;
  }
  return { x, y, width, height };
}

export function parseLogoCrop(value: unknown): LogoCropSettings | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const zoom = Number(row.zoom);
  const x = Number(row.x);
  const y = Number(row.y);
  if (!Number.isFinite(zoom) || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  const areaPercent = parseArea(row.areaPercent);
  return areaPercent ? { zoom, x, y, areaPercent } : { zoom, x, y };
}

/** True when the partner saved a crop via the logo editor (logo_url is the approved avatar). */
export function hasApprovedLogoCrop(crop: LogoCropSettings | null | undefined): boolean {
  return crop != null;
}

/** CSS positioning that reproduces react-easy-crop's croppedArea at any display size. */
export function getLogoCropImageStyle(areaPercent: Area): CSSProperties {
  const { x, y, width, height } = areaPercent;
  if (width <= 0 || height <= 0) {
    return {};
  }

  return {
    position: "absolute",
    maxWidth: "none",
    width: `${(100 / width) * 100}%`,
    height: `${(100 / height) * 100}%`,
    left: `${(-x / width) * 100}%`,
    top: `${(-y / height) * 100}%`,
  };
}

export function canRenderLogoFromCrop(
  crop: LogoCropSettings | null | undefined,
  originalSrc?: string | null
): originalSrc is string {
  return Boolean(originalSrc && crop?.areaPercent);
}

/** True when the saved crop covers nearly the entire upload (common transparent padding). */
export function isFullFrameLogoCrop(areaPercent: Area): boolean {
  return areaPercent.width >= 92 && areaPercent.height >= 92;
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

/** Render a circular PNG from the crop area (display asset). */
export async function getCroppedLogoBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  areaPercent?: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);

  let sourceX = pixelCrop.x;
  let sourceY = pixelCrop.y;
  let sourceWidth = pixelCrop.width;
  let sourceHeight = pixelCrop.height;

  if (areaPercent) {
    sourceX = (areaPercent.x / 100) * image.naturalWidth;
    sourceY = (areaPercent.y / 100) * image.naturalHeight;
    sourceWidth = (areaPercent.width / 100) * image.naturalWidth;
    sourceHeight = (areaPercent.height / 100) * image.naturalHeight;
  }

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

  const exportSize = LOGO_AVATAR_EXPORT_SIZE;
  outputCanvas.width = exportSize;
  outputCanvas.height = exportSize;

  outputCtx.beginPath();
  outputCtx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2);
  outputCtx.closePath();
  outputCtx.clip();
  outputCtx.drawImage(
    canvas,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    exportSize,
    exportSize
  );

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Logo crop export failed."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function blobToFile(blob: Blob, filename: string): Promise<File> {
  return new File([blob], filename, { type: blob.type || "image/png" });
}

export function revokeIfBlobUrl(url: string | undefined) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
