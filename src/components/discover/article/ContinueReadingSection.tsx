import Link from "next/link";
import { DiscoverArticleTile } from "@/components/discover/DiscoverArticleTile";
import { type DiscoverArticleCard } from "@/lib/discover/queries";
import { DISCOVER_FIVE_TILE_GRID_CLASS } from "@/lib/discover/image-frame";
import { heading2 } from "@/lib/ui-classes";

const CONTINUE_READING_LIMIT = 5;
const CONTINUE_READING_IMAGE_SIZES = "(max-width: 1024px) 240px, 18vw";

type ContinueReadingSectionProps = {
  articles: DiscoverArticleCard[];
};

export function ContinueReadingSection({ articles }: ContinueReadingSectionProps) {
  const items = articles.slice(0, CONTINUE_READING_LIMIT);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="continue-reading-heading" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="continue-reading-heading" className={heading2}>
          Continue Reading
        </h2>
        <Link
          href="/discover"
          className="text-sm font-semibold text-primary hover:text-primary-hover"
        >
          View all Discover
        </Link>
      </div>
      <div className={DISCOVER_FIVE_TILE_GRID_CLASS}>
        {items.map((article) => (
          <DiscoverArticleTile
            key={article.id}
            article={article}
            layout="homepage"
            imageSizes={CONTINUE_READING_IMAGE_SIZES}
          />
        ))}
      </div>
    </section>
  );
}
