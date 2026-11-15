import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DiscoverArticleTile } from "@/components/discover/DiscoverArticleTile";
import { DiscoverSectionGrid } from "@/components/discover/DiscoverSectionGrid";
import { canonicalSiteOrigin, getAppMode } from "@/lib/app-mode";
import { getPublishedArticlesByCategory } from "@/lib/discover/queries";

export const revalidate = 86400;

const TITLE = "StockUp Savings";
const DESCRIPTION =
  "Savings guides for StockUp shoppers. See how saver pricing on in-stock New Zealand groceries adds up across a weekly shop.";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const stockup =
    getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup";
  if (!stockup) return { title: "Not Found" };
  const origin = canonicalSiteOrigin("stockup");
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${origin}/discover/savings` },
    openGraph: { title: TITLE, description: DESCRIPTION, url: `${origin}/discover/savings` },
  };
}

export default async function StockUpSavingsHubPage() {
  const headerStore = await headers();
  if (getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) !== "stockup") {
    notFound();
  }

  const articles = await getPublishedArticlesByCategory("stockup", "Savings");

  return (
    <section className="bg-[#ecfdf5] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#064E3B]">StockUp</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#064E3B]">{TITLE}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{DESCRIPTION}</p>
        <div className="mt-10">
          <DiscoverSectionGrid mobileLayout="single-row-scroll">
            {articles.map((article) => (
              <DiscoverArticleTile key={article.id} article={article} variant="detailed" layout="grid" />
            ))}
          </DiscoverSectionGrid>
        </div>
      </div>
    </section>
  );
}
