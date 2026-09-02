import { getCachedHomeExploreGalleryItems } from "@/lib/cache/public-directory";

function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

/** Gallery images from live brand profiles for signed-in member hero collages. */
export async function getHomeHeroBrandGalleryImages(limit = 6): Promise<string[]> {
  const items = await getCachedHomeExploreGalleryItems();
  return uniqueUrls(items.map((item) => item.imageUrl)).slice(0, limit);
}

export type SavingsTickerImage = {
  src: string;
  alt: string;
};

/** Live partner gallery product shots for the membership checkout savings ticker. */
export async function getSavingsTickerImages(limit = 16): Promise<SavingsTickerImage[]> {
  const items = await getCachedHomeExploreGalleryItems();
  const seen = new Set<string>();
  const images: SavingsTickerImage[] = [];

  for (const item of items) {
    if (!item.imageUrl || seen.has(item.imageUrl)) continue;
    seen.add(item.imageUrl);
    images.push({
      src: item.imageUrl,
      alt: item.businessName || "Partner product",
    });
    if (images.length >= limit) break;
  }

  return images;
}
