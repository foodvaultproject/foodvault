import type { CSSProperties } from "react";
import Image from "next/image";
import {
  canRenderLogoFromCrop,
  getLogoCropImageStyle,
  hasApprovedLogoCrop,
  isFullFrameLogoCrop,
  type LogoCropSettings,
} from "@/lib/partner-logo-crop";

/** Pre-rendered circular PNG fallback when crop percentages are unavailable. */
const AVATAR_IMAGE_CLASS = "h-full w-full object-contain object-center";
/** Legacy uploads without an editor crop. */
const LEGACY_LOGO_IMAGE_CLASS = "h-full w-full object-contain scale-[1.35]";
/** Hero circles — parent supplies ~8% inset; scale compensates for PNG padding. */
const HERO_LOGO_IMAGE_CLASS =
  "h-full w-full object-contain object-center scale-[1.28]";
/** Approved circular avatar in hero — slight boost when export leaves a hairline gap. */
const HERO_AVATAR_IMAGE_CLASS =
  "h-full w-full object-contain object-center scale-[1.06]";

type PartnerLogoSize =
  | "xs"
  | "sm"
  | "md"
  | "directory"
  | "tile"
  | "carousel"
  | "fill"
  | "hero";

const SIZE_STYLES: Record<
  PartnerLogoSize,
  { box: string; fallback: string; sizes: string; legacyImageClass?: string }
> = {
  xs: {
    box: "h-14 w-14 rounded-full",
    fallback: "text-lg",
    sizes: "56px",
  },
  sm: {
    box: "h-16 w-16 rounded-full",
    fallback: "text-xl",
    sizes: "64px",
  },
  md: {
    box: "h-16 w-16 rounded-full sm:h-24 sm:w-24",
    fallback: "text-2xl sm:text-3xl",
    sizes: "96px",
  },
  directory: {
    box: "h-[4.5rem] w-[4.5rem] rounded-full sm:h-20 sm:w-20 lg:h-[4.5rem] lg:w-[4.5rem]",
    fallback: "text-xl sm:text-2xl",
    sizes: "(max-width: 1024px) 33vw, 10vw",
  },
  tile: {
    box: "aspect-square h-full w-full rounded-full",
    fallback: "text-lg sm:text-xl",
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  },
  carousel: {
    box: "h-[5.2rem] w-[5.2rem] shrink-0 rounded-full",
    fallback: "text-base",
    sizes: "83px",
  },
  fill: {
    box: "h-full w-full rounded-full",
    fallback: "text-lg",
    sizes: "192px",
  },
  hero: {
    box: "h-full w-full rounded-full",
    fallback: "text-2xl",
    sizes: "(max-width: 1280px) 0vw, 20vw",
    legacyImageClass: HERO_LOGO_IMAGE_CLASS,
  },
};

type PartnerLogoProps = {
  src?: string | null;
  /** Original upload used by the logo editor; enables exact CSS crop replay. */
  originalSrc?: string | null;
  alt: string;
  businessName: string;
  size?: PartnerLogoSize;
  className?: string;
  bordered?: boolean;
  shadow?: boolean;
  priority?: boolean;
  isCropped?: boolean;
  crop?: LogoCropSettings | null;
};

type LogoRenderMode = "cssCrop" | "avatar" | "legacy";

function isNativeImageSrc(src: string) {
  return src.startsWith("blob:") || src.startsWith("data:");
}

function resolveLogoRender({
  size,
  src,
  originalSrc,
  crop,
  isCropped,
}: {
  size: PartnerLogoSize;
  src?: string | null;
  originalSrc?: string | null;
  crop?: LogoCropSettings | null;
  isCropped: boolean;
}): {
  mode: LogoRenderMode;
  displaySrc: string | null | undefined;
  cssCropScale?: number;
} {
  const cssCropAvailable = canRenderLogoFromCrop(crop, originalSrc);
  const approvedCrop = hasApprovedLogoCrop(crop);
  const fullFrame =
    cssCropAvailable && crop?.areaPercent
      ? isFullFrameLogoCrop(crop.areaPercent)
      : false;

  // Hero: prefer the editor's circular PNG — it fills the frame better than full-frame CSS crop.
  if (size === "hero" && src && (approvedCrop || fullFrame)) {
    return { mode: "avatar", displaySrc: src };
  }

  if (cssCropAvailable && crop?.areaPercent) {
    return {
      mode: "cssCrop",
      displaySrc: originalSrc,
      cssCropScale: size === "hero" && fullFrame ? 1.28 : undefined,
    };
  }

  if (isCropped || approvedCrop) {
    return { mode: "avatar", displaySrc: src };
  }

  return { mode: "legacy", displaySrc: src };
}

function LogoImage({
  src,
  alt,
  sizes,
  priority,
  className,
  style,
  unoptimized = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className: string;
  style?: CSSProperties;
  unoptimized?: boolean;
}) {
  if (isNativeImageSrc(src) || unoptimized) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} style={style} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
    />
  );
}

export function PartnerLogo({
  src,
  originalSrc = null,
  alt,
  businessName,
  size = "sm",
  className = "",
  bordered = false,
  shadow = false,
  priority = false,
  isCropped = false,
  crop = null,
}: PartnerLogoProps) {
  const styles = SIZE_STYLES[size];
  const initial = businessName.trim().charAt(0).toUpperCase() || "?";
  const { mode, displaySrc, cssCropScale } = resolveLogoRender({
    size,
    src,
    originalSrc,
    crop,
    isCropped,
  });

  const containerClass = [
    "relative flex shrink-0 items-center justify-center overflow-hidden bg-background",
    styles.box,
    bordered ? "border border-border" : "",
    shadow ? "shadow-md" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!displaySrc) {
    return (
      <div className={containerClass} aria-hidden={alt === "" ? true : undefined}>
        <span className={`font-bold text-primary ${styles.fallback}`}>{initial}</span>
      </div>
    );
  }

  if (mode === "cssCrop" && crop?.areaPercent) {
    const cropStyle = getLogoCropImageStyle(crop.areaPercent);
    const scaledStyle: CSSProperties | undefined = cssCropScale
      ? { ...cropStyle, transform: `scale(${cssCropScale})`, transformOrigin: "center" }
      : cropStyle;

    return (
      <div className={containerClass}>
        <LogoImage
          src={displaySrc}
          alt={alt}
          sizes={styles.sizes}
          priority={priority}
          unoptimized
          className="absolute max-w-none"
          style={scaledStyle}
        />
      </div>
    );
  }

  const imageClass =
    mode === "avatar"
      ? size === "hero"
        ? HERO_AVATAR_IMAGE_CLASS
        : AVATAR_IMAGE_CLASS
      : styles.legacyImageClass ?? LEGACY_LOGO_IMAGE_CLASS;

  return (
    <div className={containerClass}>
      <LogoImage
        src={displaySrc}
        alt={alt}
        sizes={styles.sizes}
        priority={priority}
        unoptimized={mode === "avatar"}
        className={`absolute inset-0 ${imageClass}`}
      />
    </div>
  );
}
