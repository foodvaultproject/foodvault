import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscoverArticlePage } from "@/components/discover/DiscoverArticlePage";
import {
  getCachedDiscoverArticlePageData,
  getCachedDiscoverArticleSlugs,
  getCachedPublishedArticleBySlug,
} from "@/lib/cache/public-directory";
import { SITEMAP_BASE_URL } from "@/lib/sitemap/entries";

export const revalidate = 86400;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getCachedDiscoverArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedPublishedArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary ?? undefined,
    keywords: article.metaTags.length > 0 ? article.metaTags : undefined,
  };
}

export default async function DiscoverArticleRoute({ params }: Props) {
  const { slug } = await params;
  const pageData = await getCachedDiscoverArticlePageData(slug);

  if (!pageData) {
    notFound();
  }

  const canonicalUrl = `${SITEMAP_BASE_URL}/discover/${slug}`;

  return (
    <DiscoverArticlePage
      article={pageData.article}
      continueReading={pageData.continueReading}
      canonicalUrl={canonicalUrl}
    />
  );
}
