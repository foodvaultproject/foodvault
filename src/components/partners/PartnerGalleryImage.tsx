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
  const frameClass = fill
    ? `relative ${aspectClass} w-full overflow-hidden rounded-lg bg-surface ${className}`
    : `relative overflow-hidden bg-surface ${width && height ? "" : `${aspectClass} w-full`} rounded-lg ${className}`;

  if (fill) {
    return (
      <div className={frameClass}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={`object-cover ${imageClassName}`}
          sizes={sizes}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={frameClass} style={{ width, height }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
    </div>
  );
}
