import type { Metadata } from "next";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import {
  BuyingGuidesSection,
  FeaturedArticleSection,
  MeetPartnersSection,
  NewBrandsDiscoverSection,
  RecipesSection,
  SaveMoreSection,
} from "@/components/discover/DiscoverSections";
import { getDiscoverPageContent } from "@/lib/discover/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Explore guides, recipes, member stories and the latest New Zealand brands joining FoodVault.",
};

export default async function DiscoverPage() {
  const content = await getDiscoverPageContent();

  return (
    <>
      <DiscoverHeader />
      <FeaturedArticleSection article={content.featured} />
      <SaveMoreSection articles={content.byCategory["Save More Every Week"]} />
      <BuyingGuidesSection articles={content.byCategory["Food Buying Guides"]} />
      <RecipesSection articles={content.byCategory["Recipes & Inspiration"]} />
      <MeetPartnersSection articles={content.byCategory["Meet Our Partners"]} />
      <NewBrandsDiscoverSection articles={content.byCategory["New Brands This Week"]} />
    </>
  );
}
