import Link from "next/link";
import { DiscoverArticleTile } from "@/components/discover/DiscoverArticleTile";
import { SECTION_PY_HOME, SECTION_PY_HOME_PARTNER_WIDE } from "@/components/home/section-spacing";
import { type DiscoverArticleCard } from "@/lib/discover/queries";

const HOMEPAGE_DISCOVER_LIMIT = 4;
const HOMEPAGE_TILE_IMAGE_SIZES = "(max-width: 768px) 80vw, (max-width: 1200px) 25vw, 280px";

type DiscoverSectionVariant = "default" | "partner";

type DiscoverSectionProps = {
  articles: DiscoverArticleCard[];
  variant?: DiscoverSectionVariant;
  compactSpacing?: boolean;
};

const DISCOVER_COPY: Record<
  DiscoverSectionVariant,
  { heading: string; subtitle: string; ctaLabel: string }
> = {
  default: {
    heading: "Discover More Than Just Great Brands",
    subtitle: "Recipes, guides and stories from the independent food community.",
    ctaLabel: "Discover more →",
  },
  partner: {
    heading: "Grow Your Brand",
    subtitle:
      "Marketing tips, platform updates and partner success stories to help you get more from FoodVault.",
    ctaLabel: "View all resources →",
  },
};

export function DiscoverSection({
  articles,
  variant = "default",
  compactSpacing = false,
}: DiscoverSectionProps) {
  const homepageArticles = articles.slice(0, HOMEPAGE_DISCOVER_LIMIT);
  if (homepageArticles.length === 0) return null;

  const copy = DISCOVER_COPY[variant];

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

        <div className={`${compactSpacing ? "mt-3" : "mt-6"} grid grid-cols-2 gap-4 lg:grid-cols-4`}>
          {homepageArticles.map((article) => (
            <DiscoverArticleTile
              key={article.id}
              article={article}
              layout="homepage"
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
