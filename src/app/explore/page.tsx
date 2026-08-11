import type { Metadata } from "next";
import { ExploreSaveFeed } from "@/components/explore/ExploreSaveFeed";
import { getCachedHomeExploreGalleryItems } from "@/lib/cache/public-directory";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Explore & Save",
  description:
    "Discover gallery moments from FoodVault partner brands and visit the brands you love.",
};

export default async function ExplorePage() {
  const items = await getCachedHomeExploreGalleryItems();

  return (
    <section className="bg-background">
      <ExploreSaveFeed
        items={items}
        canFavorite={false}
        favoritedPartnerIds={[]}
      />
    </section>
  );
}
