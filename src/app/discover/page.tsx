import type { Metadata } from "next";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import {
  FeaturedArticleSection,
  SavingSection,
  PartnersSection,
  RecipesSection,
  NewsSection,
} from "@/components/discover/DiscoverSections";
import { getCachedDiscoverPageContent } from "@/lib/cache/public-directory";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: DISCOVER_PAGE_TITLE,
  description:
    "Explore guides, recipes, member stories and the latest New Zealand brands joining FoodVault.",
};

export default async function DiscoverPage() {
  const content = await getCachedDiscoverPageContent();

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
