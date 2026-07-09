import {
  GALLERY_ASPECT,
  GALLERY_OUTPUT_HEIGHT,
  GALLERY_OUTPUT_WIDTH,
  getCroppedGalleryBlob,
  revokeIfBlobUrl,
  type Area,
} from "@/lib/partner-gallery-crop";

export type ArticleHeroCropSettings = {
  zoom: number;
  x: number;
  y: number;
};

/** Same 4:5 portrait dimensions as homepage Discover tiles and brand gallery. */
export const ARTICLE_HERO_ASPECT = GALLERY_ASPECT;
export const ARTICLE_HERO_OUTPUT_WIDTH = GALLERY_OUTPUT_WIDTH;
export const ARTICLE_HERO_OUTPUT_HEIGHT = GALLERY_OUTPUT_HEIGHT;

export const DEFAULT_ARTICLE_HERO_CROP: ArticleHeroCropSettings = {
  zoom: 1,
  x: 0,
  y: 0,
};

/** Render a 4:5 JPEG from the crop area (1080×1350 display asset). */
export async function getCroppedArticleHeroBlob(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  return getCroppedGalleryBlob(imageSrc, pixelCrop);
}

export { revokeIfBlobUrl };
