import type { Metadata } from "next";
import { ExploreSaveFeed } from "@/components/explore/ExploreSaveFeed";
import { getHomeExploreGalleryItems } from "@/lib/member/home-explore-gallery";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore & Save",
  description:
    "Discover gallery moments from FoodVault partner brands and visit the brands you love.",
};

export default async function ExplorePage() {
  const [items, favoriteContext] = await Promise.all([
    getHomeExploreGalleryItems(),
    getViewerFavoriteContext(),
  ]);

  return (
    <section className="bg-background">
      <ExploreSaveFeed
        items={items}
        canFavorite={favoriteContext.canFavorite}
        favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
      />
    </section>
  );
}
