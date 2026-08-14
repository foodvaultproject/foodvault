import { getCachedHomeExploreGalleryItems } from "@/lib/cache/public-directory";

function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

/** Gallery images from live brand profiles for signed-in member hero collages. */
export async function getHomeHeroBrandGalleryImages(limit = 6): Promise<string[]> {
  const items = await getCachedHomeExploreGalleryItems();
  return uniqueUrls(items.map((item) => item.imageUrl)).slice(0, limit);
}
