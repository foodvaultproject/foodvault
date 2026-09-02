/** True when the browser can render the src without the Next.js image optimizer. */
export function isNativeImageSrc(src: string) {
  return src.startsWith("blob:") || src.startsWith("data:");
}

export function revokeIfBlobUrl(url: string | undefined) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Prefer a blob: object URL so local file previews never hit Supabase Storage.
 * Falls back to a data: URL when createObjectURL is unavailable.
 */
export async function createLocalPreviewUrl(file: Blob): Promise<string> {
  if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    try {
      return URL.createObjectURL(file);
    } catch {
      // Fall through to a data URL — some environments block object URLs.
    }
  }

  return readBlobAsDataUrl(file);
}

export function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string" && result.length > 0) {
        resolve(result);
        return;
      }
      reject(new Error("Unable to read file as a data URL."));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Unable to read file as a data URL."));
    };
    reader.readAsDataURL(blob);
  });
}
