import Image from "next/image";
import {
  DISCOVER_TILE_IMAGE_CLASS,
  DISCOVER_TILE_WIDTH_CLASS,
} from "@/lib/discover/image-frame";

type ArticleHeroImageProps = {
  src: string;
  alt: string;
};

export function ArticleHeroImage({ src, alt }: ArticleHeroImageProps) {
  return (
    <div className={`${DISCOVER_TILE_WIDTH_CLASS} mx-auto shrink-0 lg:mx-0`}>
      <div
        className={`${DISCOVER_TILE_IMAGE_CLASS} overflow-hidden rounded-lg border border-border bg-background`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="256px"
        />
      </div>
    </div>
  );
}
