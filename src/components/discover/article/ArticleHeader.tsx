import { ArticleCategoryLabel } from "@/components/discover/article/ArticleCategoryLabel";
import { formatPublishDate, formatReadTime } from "@/lib/discover/queries";
import { heading1 } from "@/lib/ui-classes";

type ArticleHeaderProps = {
  category: string;
  title: string;
  summary: string | null;
  authorName: string | null;
  publishDate: string | null;
  readTimeMinutes: number;
};

export function ArticleHeader({
  category,
  title,
  summary,
  authorName,
  publishDate,
  readTimeMinutes,
}: ArticleHeaderProps) {
  const metadataParts = [
    authorName,
    publishDate ? formatPublishDate(publishDate) : null,
    formatReadTime(readTimeMinutes),
  ].filter(Boolean);

  return (
    <header className="space-y-5 sm:space-y-6">
      <ArticleCategoryLabel category={category} />

      <h1 className={`max-w-4xl ${heading1}`}>
        {title}
      </h1>

      {summary ? (
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-[1.375rem] sm:leading-[1.65]">
          {summary}
        </p>
      ) : null}

      {metadataParts.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          {metadataParts.join(" • ")}
        </p>
      ) : null}
    </header>
  );
}
