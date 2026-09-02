"use client";

import NextImage, { type ImageProps } from "next/image";
import {
  useState,
  type CSSProperties,
  type ReactEventHandler,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { isNativeImageSrc } from "@/lib/image-preview";

export type SafeImageFallbackVariant = "muted" | "initials" | "logo" | "empty";

export type SafeImageProps = Omit<ImageProps, "onError"> & {
  /** Replaces the default placeholder when the image fails to load. */
  fallback?: ReactNode;
  fallbackVariant?: SafeImageFallbackVariant;
  /** Used with fallbackVariant="initials" (first character is shown). */
  initials?: string;
  onError?: ImageProps["onError"];
};

function srcKey(src: ImageProps["src"] | undefined): string {
  if (!src) return "";
  if (typeof src === "string") return src;
  if (typeof src === "object" && "src" in src && typeof src.src === "string") {
    return src.src;
  }
  return "static";
}

function PlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
      />
    </svg>
  );
}

function ImagePlaceholder({
  fill,
  width,
  height,
  variant,
  initials,
  className,
}: {
  fill?: boolean;
  width?: ImageProps["width"];
  height?: ImageProps["height"];
  variant: SafeImageFallbackVariant;
  initials?: string;
  className?: string;
}) {
  if (variant === "empty") {
    return null;
  }

  const letter = initials?.trim().charAt(0).toUpperCase() || "";
  const sized = !fill && width != null && height != null;
  const frameClass = [
    "flex items-center justify-center overflow-hidden bg-surface text-muted-light",
    fill ? "absolute inset-0 h-full w-full" : "h-full w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content =
    variant === "initials" && letter ? (
      <span className="select-none font-bold text-primary">{letter}</span>
    ) : variant === "logo" ? (
      // Local static asset — never fetched from Supabase Storage.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/foodvault-logo.png"
        alt=""
        className="h-1/2 w-auto max-h-8 max-w-[70%] object-contain opacity-40"
      />
    ) : (
      <PlaceholderIcon className="h-1/3 w-1/3 max-h-10 max-w-10" />
    );

  return (
    <span
      className={frameClass}
      style={sized ? { width, height } : undefined}
      aria-hidden="true"
    >
      {content}
    </span>
  );
}

function SafeImageInner({
  src,
  alt,
  onError,
  fallback,
  fallbackVariant = "muted",
  initials,
  className,
  style,
  fill,
  width,
  height,
  sizes,
  priority,
  ...rest
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const srcString = typeof src === "string" ? src : null;
  const missing = !src || srcString === "";

  function handleError(event: SyntheticEvent<HTMLImageElement, Event>) {
    event.currentTarget.style.display = "none";
    setFailed(true);
    onError?.(event);
  }

  if (missing || failed) {
    if (fallback) {
      if (!fill) return <>{fallback}</>;
      return (
        <span className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden">
          {fallback}
        </span>
      );
    }

    return (
      <ImagePlaceholder
        fill={fill}
        width={width}
        height={height}
        variant={fallbackVariant}
        initials={initials}
      />
    );
  }

  if (srcString && isNativeImageSrc(srcString)) {
    const nativeStyle: CSSProperties | undefined = fill
      ? {
          position: "absolute",
          height: "100%",
          width: "100%",
          left: 0,
          top: 0,
          ...style,
        }
      : style;

    return (
      // Local blob/data previews — next/image cannot optimize these.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={srcString}
        alt={alt}
        width={fill ? undefined : typeof width === "number" ? width : undefined}
        height={fill ? undefined : typeof height === "number" ? height : undefined}
        className={className}
        style={nativeStyle}
        onError={handleError as ReactEventHandler<HTMLImageElement>}
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      onError={handleError}
      {...rest}
    />
  );
}

/**
 * Drop-in next/image wrapper. On 402/404/CORS failures, renders a placeholder
 * instead of the browser's broken-image icon.
 */
export function SafeImage(props: SafeImageProps) {
  return <SafeImageInner key={srcKey(props.src)} {...props} />;
}
