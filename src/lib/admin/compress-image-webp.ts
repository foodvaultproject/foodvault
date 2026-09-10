const WEBP_QUALITY = 0.82;
const JPEG_QUALITY = 0.85;
const DEFAULT_MAX_DIMENSION = 1800;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), 15_000);
    canvas.toBlob((blob) => {
      window.clearTimeout(timer);
      resolve(blob);
    }, type, quality);
  });
}

async function decodeImage(file: File): Promise<{
  source: HTMLImageElement | ImageBitmap;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, cleanup: () => bitmap.close() };
    } catch {
      // Fall through to HTMLImageElement for formats/browsers bitmap cannot decode.
    }
  }

  const url = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const next = new Image();
    next.onload = () => resolve(next);
    next.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image. Try a JPEG or PNG photo."));
    };
    next.src = url;
  });
  return {
    source: image,
    cleanup: () => URL.revokeObjectURL(url),
  };
}

function sourceSize(source: HTMLImageElement | ImageBitmap) {
  if ("naturalWidth" in source && source.naturalWidth) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  return { width: source.width, height: source.height };
}

/** Client-side canvas conversion used before product / NIP image uploads. */
export async function convertImageToWebpFile(
  file: File,
  options?: { maxDimension?: number }
): Promise<File> {
  if (file.size === 0) {
    throw new Error("That image file is empty.");
  }

  const decoded = await decodeImage(file);
  const { width: srcW, height: srcH } = sourceSize(decoded.source);
  if (!srcW || !srcH) {
    decoded.cleanup();
    throw new Error("Could not read that image. Try a JPEG or PNG photo.");
  }

  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    decoded.cleanup();
    throw new Error("Could not prepare that image for upload.");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(decoded.source, 0, 0, width, height);
  decoded.cleanup();

  let blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  let mime = "image/webp";
  let ext = "webp";

  if (!blob || blob.size === 0) {
    blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
    mime = "image/jpeg";
    ext = "jpg";
  }

  if (!blob || blob.size === 0) {
    throw new Error("Could not compress that image. Try a different photo.");
  }

  const baseName = file.name.replace(/\.[^.]+$/i, "") || "image";
  return new File([blob], `${baseName}.${ext}`, {
    type: mime,
    lastModified: Date.now(),
  });
}
