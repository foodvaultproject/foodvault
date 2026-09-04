import { SafeImage } from "@/components/media/SafeImage";

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
  "left-[2%] top-[18%] z-10 -rotate-4",
  "left-[24%] top-[0%] z-20 rotate-2",
  "right-[0%] top-[14%] z-30 rotate-3",
] as const;

function CollageImage({
  src,
  className,
  priority,
  partner,
}: {
  src: string;
  className?: string;
  priority?: boolean;
  partner?: boolean;
}) {
  return (
    <div
      className={`absolute aspect-[4/5] overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-card ${
        partner ? "w-[52%] max-w-[10rem]" : "w-[44%] max-w-[11rem]"
      } ${className ?? ""}`}
    >
      <SafeImage
        src={src}
        alt=""
        fill
        sizes={partner ? "(max-width: 768px) 52vw, 10rem" : "(max-width: 768px) 44vw, 11rem"}
        className="object-cover"
        priority={priority}
        fallbackVariant="muted"
      />
    </div>
  );
}

export function HomeHeroGalleryCollage({
  images,
  variant = "member",
}: HomeHeroGalleryCollageProps) {
  const isPartner = variant === "partner";
  const limit = isPartner ? 3 : 6;
  const displayImages = images.filter(Boolean).slice(0, limit);
  const positions = isPartner ? partnerPositions : memberPositions;

  if (displayImages.length === 0) {
    return (
      <div
        className={`relative mx-auto w-full max-w-[20rem] md:max-w-none ${
          isPartner ? "aspect-[16/10]" : "aspect-[4/5]"
        }`}
      >
        <div className={`absolute rounded-2xl bg-white/10 ${isPartner ? "inset-[8%]" : "inset-[12%]"}`} />
      </div>
    );
  }

  return (
    <div
      className={`relative mx-auto w-full max-w-[20rem] md:max-w-none ${
        isPartner ? "aspect-[16/10]" : "aspect-[4/5]"
      }`}
    >
      <div className={`absolute rounded-2xl bg-white/10 ${isPartner ? "inset-[8%]" : "inset-[10%]"}`} />
      {displayImages.map((image, index) => (
        <CollageImage
          key={`${image}-${index}`}
          src={image}
          className={positions[index] ?? positions[0]}
          priority={index < 2}
          partner={isPartner}
        />
      ))}
    </div>
  );
}
