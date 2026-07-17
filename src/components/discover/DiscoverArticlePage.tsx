import { ArticleBody } from "@/components/discover/article/ArticleBody";
import { ArticleBreadcrumb } from "@/components/discover/article/ArticleBreadcrumb";
import { ArticleHeader } from "@/components/discover/article/ArticleHeader";
import { ArticleHeroImage } from "@/components/discover/article/ArticleHeroImage";
import { ArticleSeoMetadata } from "@/components/discover/article/ArticleSeoMetadata";
import { ArticleTags } from "@/components/discover/article/ArticleTags";
import { ContinueReadingSection } from "@/components/discover/article/ContinueReadingSection";
import type { DiscoverArticleCard, DiscoverArticlePageData } from "@/lib/discover/queries";

type DiscoverArticlePageProps = {
  article: DiscoverArticlePageData;
  continueReading: DiscoverArticleCard[];
  canonicalUrl: string;
};

export function DiscoverArticlePage({
  article,
  continueReading,
  canonicalUrl,
}: DiscoverArticlePageProps) {
  return (
    <>
      <ArticleSeoMetadata article={article} url={canonicalUrl} />

      <article className="bg-background pb-0 pt-8 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ArticleBreadcrumb />

          <div className="mt-8 sm:mt-10">
            <ArticleHeader
              category={article.category}
              title={article.title}
              summary={article.summary}
              authorName={article.authorName}
              publishDate={article.publishDate}
              readTimeMinutes={article.readTimeMinutes}
            />
          </div>

          <div className="mt-10 flex flex-col gap-10 sm:mt-12 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
            <ArticleHeroImage src={article.heroImageUrl} alt={article.title} />
            <div className="min-w-0 flex-1 lg:max-w-[760px]">
              <ArticleBody body={article.body} />
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-10 sm:mt-16 sm:pt-12">
            <ArticleTags tags={article.metaTags} />
          </div>

          <div className="mt-12 border-t border-border pt-10 sm:mt-16 sm:pt-12">
            <ContinueReadingSection articles={continueReading} />
          </div>
        </div>
      </article>
    </>
  );
}
