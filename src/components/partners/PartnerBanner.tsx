import type { ReactNode } from "react";
import { SafeImage } from "@/components/media/SafeImage";

type PartnerBannerProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  children?: ReactNode;
};

export function PartnerBanner({
  src,
  alt = "",
  className = "",
  imageClassName = "",
  sizes = "(max-width: 1152px) 100vw, 1152px",
  priority = false,
  children,
}: PartnerBannerProps) {
  return (
    <div
      className={`relative aspect-[3/1] w-full overflow-hidden bg-gradient-to-br from-primary/30 to-primary/5 ${className}`}
    >
      {src ? (
        <SafeImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={`object-cover ${imageClassName}`}
          sizes={sizes}
          fallbackVariant="empty"
        />
      ) : null}
      {children}
    </div>
  );
}
