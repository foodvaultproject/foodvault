import type { Metadata } from "next";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import {
  FeaturedArticleSection,
  SavingSection,
  PartnersSection,
  RecipesSection,
  NewsSection,
} from "@/components/discover/DiscoverSections";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";
import { getDiscoverPageContent } from "@/lib/discover/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: DISCOVER_PAGE_TITLE,
  description:
    "Explore guides, recipes, member stories and the latest New Zealand brands joining FoodVault.",
};

export default async function DiscoverPage() {
  const content = await getDiscoverPageContent();

  return (
    <>
      <DiscoverHeader />
      <FeaturedArticleSection article={content.featured} />
      <SavingSection articles={content.byCategory.Saving} />
      <RecipesSection articles={content.byCategory.Recipes} />
      <PartnersSection articles={content.byCategory.Brands} />
      <NewsSection articles={content.byCategory.News} />
    </>
  );
}
