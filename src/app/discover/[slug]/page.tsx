import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DiscoverArticlePage } from "@/components/discover/DiscoverArticlePage";
import { canonicalSiteOrigin, getAppMode } from "@/lib/app-mode";
import {
  getCachedDiscoverArticlePageData,
  getCachedDiscoverArticleSlugs,
  getCachedPublishedArticleBySlug,
} from "@/lib/cache/public-directory";
import { RESERVED_DISCOVER_SLUGS } from "@/lib/discover/categories";
import { formatPublishDate } from "@/lib/discover/queries";
import { getVaultMarketProductById } from "@/lib/commerce/products";
import type { DiscoverSite } from "@/lib/admin/types";

export const revalidate = 86400;

type Props = {
  params: Promise<{ slug: string }>;
};

async function requestDiscoverSite(): Promise<DiscoverSite> {
  const headerStore = await headers();
  return getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup"
    ? "stockup"
    : "foodvault";
}

export async function generateStaticParams() {
  const [foodvault, stockup] = await Promise.all([
    getCachedDiscoverArticleSlugs("foodvault"),
    getCachedDiscoverArticleSlugs("stockup"),
  ]);
  return [...foodvault, ...stockup]
    .filter((slug) => !(RESERVED_DISCOVER_SLUGS as readonly string[]).includes(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await requestDiscoverSite();
  const article = await getCachedPublishedArticleBySlug(slug, site);
  const origin = canonicalSiteOrigin(site);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const image = article.heroImageUrl || "/opengraph-image.jpg";
  const title = article.metaTitle ?? article.title;
  const description = article.metaDescription ?? article.summary ?? undefined;

  return {
    title,
    description,
    keywords: article.metaTags.length > 0 ? article.metaTags : undefined,
    alternates: { canonical: `${origin}/discover/${slug}` },
    openGraph: {
      title,
      description,
      url: `${origin}/discover/${slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function DiscoverArticleRoute({ params }: Props) {
  const { slug } = await params;
  if ((RESERVED_DISCOVER_SLUGS as readonly string[]).includes(slug)) notFound();

  const site = await requestDiscoverSite();
  const pageData = await getCachedDiscoverArticlePageData(slug, site);
  if (!pageData) notFound();

  const origin = canonicalSiteOrigin(site);
  const updatedLabel =
    pageData.article.updatedAt &&
    pageData.article.publishDate &&
    Date.parse(pageData.article.updatedAt) - Date.parse(pageData.article.publishDate) > 60_000
      ? formatPublishDate(pageData.article.updatedAt)
      : null;
  const relatedProducts =
    site === "stockup"
      ? (
          await Promise.all(
            pageData.article.relatedProductIds.map((id) => getVaultMarketProductById(id))
          )
        ).filter((product): product is NonNullable<typeof product> => Boolean(product?.is_active))
      : [];

  return (
    <DiscoverArticlePage
      article={pageData.article}
      continueReading={pageData.continueReading}
      canonicalUrl={`${origin}/discover/${slug}`}
      relatedProducts={relatedProducts}
      updatedLabel={updatedLabel}
    />
  );
}
