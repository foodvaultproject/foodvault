import type { DiscoverArticlePageData } from "@/lib/discover/queries";

type ArticleSeoMetadataProps = {
  article: DiscoverArticlePageData;
  url: string;
};

export function ArticleSeoMetadata({ article, url }: ArticleSeoMetadataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary ?? undefined,
    image: article.heroImageUrl,
    author: article.authorName
      ? { "@type": "Person", name: article.authorName }
      : undefined,
    datePublished: article.publishDate ?? undefined,
    dateModified: article.updatedAt ?? article.publishDate ?? undefined,
    articleSection: article.category,
    keywords: article.metaTags.length > 0 ? article.metaTags.join(", ") : undefined,
    timeRequired: `PT${article.readTimeMinutes}M`,
    mainEntityOfPage: url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
