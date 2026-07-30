"use client";

import imageCompression from "browser-image-compression";

const SKIP_TYPES = new Set(["image/svg+xml", "image/webp", "image/gif"]);

export async function compressImageForUpload(
  file: File,
  options?: { maxWidthOrHeight?: number; quality?: number }
): Promise<File> {
  const maxWidthOrHeight = options?.maxWidthOrHeight ?? 1920;
  const quality = options?.quality ?? 0.85;

  if (!file.type.startsWith("image/") || SKIP_TYPES.has(file.type)) {
    return file;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "svg") {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: quality,
    });

    const baseName = file.name.replace(/\.[^.]+$/i, "") || "image";
    return new File([compressed], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export async function compressImageFilesForUpload(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImageForUpload(file)));
}
