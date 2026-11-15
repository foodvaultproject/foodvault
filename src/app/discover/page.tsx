import type { Metadata } from "next";
import { headers } from "next/headers";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import {
  FeaturedArticleSection,
  SavingSection,
  PartnersSection,
  RecipesSection,
  NewsSection,
} from "@/components/discover/DiscoverSections";
import { DiscoverSectionGrid } from "@/components/discover/DiscoverSectionGrid";
import { DiscoverArticleTile } from "@/components/discover/DiscoverArticleTile";
import { getCachedDiscoverPageContent } from "@/lib/cache/public-directory";
import { canonicalSiteOrigin, getAppMode } from "@/lib/app-mode";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";
import type { DiscoverSite } from "@/lib/admin/types";
import Link from "next/link";

export const revalidate = 86400;

async function requestDiscoverSite(): Promise<DiscoverSite> {
  const headerStore = await headers();
  return getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup"
    ? "stockup"
    : "foodvault";
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await requestDiscoverSite();
  const origin = canonicalSiteOrigin(site);
  if (site === "stockup") {
    return {
      title: "News & Savings",
      description:
        "StockUp news and savings guides for New Zealand grocery delivery, with saver pricing on everyday products.",
      alternates: { canonical: `${origin}/discover` },
    };
  }

  return {
    title: DISCOVER_PAGE_TITLE,
    description:
      "Explore guides, recipes, member stories and the latest New Zealand brands joining FoodVault.",
    alternates: { canonical: `${origin}/discover` },
  };
}

export default async function DiscoverPage() {
  const site = await requestDiscoverSite();
  const content = await getCachedDiscoverPageContent(site);

  if (site === "stockup") {
    return (
      <>
        <DiscoverHeader stockup />
        <FeaturedArticleSection article={content.featured} />
        <section id="news" className="bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-[#064E3B]">News</h2>
              <Link href="/discover/news" className="text-sm font-semibold text-[#064E3B]">
                All news
              </Link>
            </div>
            <DiscoverSectionGrid mobileLayout="single-row-scroll">
              {(content.byCategory.News ?? []).map((article) => (
                <DiscoverArticleTile key={article.id} article={article} variant="detailed" layout="grid" />
              ))}
            </DiscoverSectionGrid>
          </div>
        </section>
        <section id="savings" className="bg-[#ecfdf5] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-[#064E3B]">Savings</h2>
              <Link href="/discover/savings" className="text-sm font-semibold text-[#064E3B]">
                All savings
              </Link>
            </div>
            <DiscoverSectionGrid mobileLayout="single-row-scroll">
              {(content.byCategory.Savings ?? []).map((article) => (
                <DiscoverArticleTile key={article.id} article={article} variant="detailed" layout="grid" />
              ))}
            </DiscoverSectionGrid>
          </div>
        </section>
        <section className="bg-[#064E3B] py-12 text-center text-white">
          <h2 className="text-2xl font-bold">Shop saver pricing</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
            Browse the StockUp pantry and add everyday groceries to your cart.
          </p>
          <Link
            href="/pantry"
            className="mt-6 inline-flex rounded-sm bg-white px-6 py-3 text-sm font-semibold text-[#064E3B]"
          >
            Shop StockUp
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <DiscoverHeader />
      <FeaturedArticleSection article={content.featured} />
      <SavingSection articles={content.byCategory.Saving ?? []} />
      <RecipesSection articles={content.byCategory.Recipes ?? []} />
      <PartnersSection articles={content.byCategory.Brands ?? []} />
      <NewsSection articles={content.byCategory.News ?? []} />
    </>
  );
}
