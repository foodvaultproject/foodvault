import Image from "next/image";

type PartnerGalleryImageProps = {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  square?: boolean;
};

function isNativeImageSrc(src: string) {
  return src.startsWith("blob:") || src.startsWith("data:");
}

export function PartnerGalleryImage({
  src,
  alt = "",
  className = "",
  imageClassName = "",
  sizes = "(max-width: 640px) 50vw, 33vw",
  priority = false,
  fill = true,
  width,
  height,
  square = false,
}: PartnerGalleryImageProps) {
  const aspectClass = square ? "aspect-square" : "aspect-[4/5]";
  const useFixedSize = !fill && Boolean(width && height);
  const frameClass = fill
    ? `relative ${aspectClass} w-full overflow-hidden rounded-lg bg-surface ${className}`
    : `relative overflow-hidden bg-surface ${useFixedSize ? "" : `${aspectClass} w-full`} rounded-lg ${className}`;

  const media = isNativeImageSrc(src) ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
    />
  ) : (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={`object-cover ${imageClassName}`}
      sizes={useFixedSize ? `${width}px` : sizes}
    />
  );

  return (
    <div className={frameClass} style={useFixedSize ? { width, height } : undefined}>
      {media}
    </div>
  );
}
