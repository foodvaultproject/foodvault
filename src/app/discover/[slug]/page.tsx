import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DiscoverArticlePage } from "@/components/discover/DiscoverArticlePage";
import { getDiscoverArticlePageData, getPublishedArticleBySlug } from "@/lib/discover/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary ?? undefined,
    keywords: article.metaTags.length > 0 ? article.metaTags : undefined,
  };
}

function resolveCanonicalUrl(slug: string, host: string | null) {
  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}/discover/${slug}`;
  }
  return `/discover/${slug}`;
}

export default async function DiscoverArticleRoute({ params }: Props) {
  const { slug } = await params;
  const pageData = await getDiscoverArticlePageData(slug);

  if (!pageData) {
    notFound();
  }

  const headerStore = await headers();
  const host = headerStore.get("host");
  const canonicalUrl = resolveCanonicalUrl(slug, host);

  return (
    <DiscoverArticlePage
      article={pageData.article}
      continueReading={pageData.continueReading}
      canonicalUrl={canonicalUrl}
    />
  );
}
