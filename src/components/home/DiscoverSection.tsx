import Link from "next/link";
import { brandTileGridGapClass } from "@/components/browse-brands/brand-card-layout";
import { DiscoverArticleTile } from "@/components/discover/DiscoverArticleTile";
import { SECTION_PY_HOME, SECTION_PY_HOME_PARTNER_WIDE } from "@/components/home/section-spacing";
import { type DiscoverArticleCard } from "@/lib/discover/queries";

const HOMEPAGE_DISCOVER_LIMIT = 6;
const HOMEPAGE_TILE_IMAGE_SIZES = "(max-width: 768px) 50vw, (max-width: 1200px) 16vw, 180px";

type DiscoverSectionProps = {
  articles: DiscoverArticleCard[];
  compactSpacing?: boolean;
};

const DISCOVER_COPY = {
  heading: "Discover More Than Just Great Brands",
  subtitle: "Recipes, guides and stories from the independent food community.",
  ctaLabel: "Discover more →",
};

export function DiscoverSection({
  articles,
  compactSpacing = false,
}: DiscoverSectionProps) {
  const homepageArticles = articles.slice(0, HOMEPAGE_DISCOVER_LIMIT);
  if (homepageArticles.length === 0) return null;

  const copy = DISCOVER_COPY;

  return (
    <section
      className={`bg-background ${
        compactSpacing ? SECTION_PY_HOME_PARTNER_WIDE : SECTION_PY_HOME
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {copy.heading}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
          </div>
          <Link
            href="/discover"
            className="hidden shrink-0 text-xs font-semibold text-primary transition-colors hover:text-primary-hover sm:inline-flex"
          >
            {copy.ctaLabel}
          </Link>
        </div>

        <div
          className={`${compactSpacing ? "mt-3" : "mt-6"} ${brandTileGridGapClass} grid grid-cols-2 lg:grid-cols-6`}
        >
          {homepageArticles.map((article) => (
            <DiscoverArticleTile
              key={article.id}
              article={article}
              layout="grid"
              imageSizes={HOMEPAGE_TILE_IMAGE_SIZES}
              variant="overlay"
            />
          ))}
        </div>

        <Link
          href="/discover"
          className="mt-4 inline-flex text-xs font-semibold text-primary transition-colors hover:text-primary-hover sm:hidden"
        >
          {copy.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
