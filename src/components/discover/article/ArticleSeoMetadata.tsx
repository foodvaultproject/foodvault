import { STOCKUP_ORIGIN } from "@/lib/app-mode";
import { STOCKUP_PUBLISHER_NAME } from "@/lib/discover/constants";
import { stockupCategoryHubPath } from "@/lib/discover/categories";
import type { DiscoverArticlePageData } from "@/lib/discover/queries";

type ArticleSeoMetadataProps = {
  article: DiscoverArticlePageData;
  url: string;
};

export function ArticleSeoMetadata({ article, url }: ArticleSeoMetadataProps) {
  const stockup = article.site === "stockup";
  const hubPath = stockupCategoryHubPath(article.category);
  const origin = stockup ? STOCKUP_ORIGIN : url.split("/discover/")[0];
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary ?? undefined,
    image: article.heroImageUrl,
    author: article.authorName ? { "@type": "Person", name: article.authorName } : undefined,
    publisher: stockup
      ? {
          "@type": "Organization",
          name: STOCKUP_PUBLISHER_NAME,
          url: STOCKUP_ORIGIN,
        }
      : undefined,
    datePublished: article.publishDate ?? undefined,
    dateModified: article.updatedAt ?? article.publishDate ?? undefined,
    articleSection: article.category,
    keywords: article.metaTags.length > 0 ? article.metaTags.join(", ") : undefined,
    timeRequired: `PT${article.readTimeMinutes}M`,
    mainEntityOfPage: url,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: stockup ? "StockUp" : "FoodVault", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: stockup ? "News & Savings" : "What's Happening?",
        item: `${origin}/discover`,
      },
      ...(hubPath
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: article.category,
              item: `${origin}${hubPath}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: hubPath ? 4 : 3,
        name: article.title,
        item: url,
      },
    ],
  };
  const faq =
    article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqs.map((faqItem) => ({
            "@type": "Question",
            name: faqItem.question,
            acceptedAnswer: { "@type": "Answer", text: faqItem.answer },
          })),
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faq ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      ) : null}
    </>
  );
}
