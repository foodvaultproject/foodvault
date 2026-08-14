type HomeHeroGalleryCollageProps = {
  images: string[];
  variant?: "member" | "partner";
};

const memberPositions = [
  "left-[0%] top-[6%] -rotate-6",
  "right-[0%] top-[0%] rotate-3",
  "left-[10%] bottom-[4%] rotate-2",
  "right-[6%] bottom-[8%] -rotate-3",
  "left-[34%] top-[24%] rotate-1",
  "right-[28%] bottom-[22%] -rotate-2",
] as const;

const partnerPositions = [
  "left-[0%] bottom-[6%] -rotate-3",
  "left-[28%] top-[8%] rotate-2",
  "right-[0%] bottom-[0%] rotate-3",
] as const;

function CollageImage({
  src,
  className,
  priority,
}: {
  src: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`absolute w-[44%] max-w-[11rem] overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-card ${className ?? ""}`}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="aspect-[4/5] h-full w-full object-cover"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}

export function HomeHeroGalleryCollage({
  images,
  variant = "member",
}: HomeHeroGalleryCollageProps) {
  const limit = variant === "partner" ? 3 : 6;
  const displayImages = images.filter(Boolean).slice(0, limit);
  const positions = variant === "partner" ? partnerPositions : memberPositions;

  if (displayImages.length === 0) {
    return (
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[20rem] md:max-w-none">
        <div className="absolute inset-[12%] rounded-2xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[20rem] md:max-w-none">
      <div className="absolute inset-[10%] rounded-2xl bg-white/10" />
      {displayImages.map((image, index) => (
        <CollageImage
          key={`${image}-${index}`}
          src={image}
          className={positions[index] ?? positions[0]}
          priority={index < 2}
        />
      ))}
    </div>
  );
}
