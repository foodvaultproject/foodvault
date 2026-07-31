import Link from "next/link";
import type { ReactNode } from "react";
import {
  NewBrandCard,
  TopMemberOfferCard,
  TrendingThisWeekCard,
} from "@/components/home/HomeTrendingBrandCards";
import { brandTileGridGapClass } from "@/components/browse-brands/brand-card-layout";
import { SECTION_PY_HOME_PARTNER, SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";
import type { BrandCard } from "@/lib/member/browse-brands-types";

type HomeTrendingSectionProps = {
  trending: BrandCard[];
  newBrands: BrandCard[];
  topOffers: BrandCard[];
  /** Hide the "View all" links that navigate to the standalone Discover page. */
  hideViewAll?: boolean;
  compactSpacing?: boolean;
};

type TrendingBlockProps = {
  title: string;
  icon: ReactNode;
  viewAllHref: string;
  viewAllLabel: string;
  hideViewAll?: boolean;
  children: ReactNode;
};

function TrendingBlock({
  title,
  icon,
  viewAllHref,
  viewAllLabel,
  hideViewAll = false,
  children,
}: TrendingBlockProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
            {icon}
          </span>
          <h3 className="text-base font-bold text-foreground sm:text-lg">{title}</h3>
        </div>
        {hideViewAll ? null : (
          <Link
            href={viewAllHref}
            className="shrink-0 text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary-hover sm:text-sm"
          >
            {viewAllLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export function HomeTrendingSection({
  trending,
  newBrands,
  topOffers,
  hideViewAll = false,
  compactSpacing = false,
}: HomeTrendingSectionProps) {
  if (trending.length === 0 && newBrands.length === 0 && topOffers.length === 0) {
    return null;
  }

  const sectionGap = compactSpacing ? "space-y-5 sm:space-y-6" : "space-y-8 sm:space-y-10";

  return (
    <section
      className={`bg-surface-lavender ${
        compactSpacing ? SECTION_PY_HOME_PARTNER : SECTION_PY_HOME_REFINE
      }`}
    >
      <div className={`mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 ${sectionGap}`}>
        {trending.length > 0 ? (
          <TrendingBlock
            title="Trending this week"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            }
            viewAllHref="/browse-brands"
            viewAllLabel="View all trending →"
            hideViewAll={hideViewAll}
          >
            <div className={`${brandTileGridGapClass} grid grid-cols-1 sm:grid-cols-2`}>
              {trending.slice(0, 4).map((brand) => (
                <TrendingThisWeekCard key={brand.id} brand={brand} />
              ))}
            </div>
          </TrendingBlock>
        ) : null}

        {newBrands.length > 0 ? (
          <TrendingBlock
            title="New brands"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            }
            viewAllHref="/browse-brands"
            viewAllLabel="View all new brands →"
            hideViewAll={hideViewAll}
          >
            <div className={`${brandTileGridGapClass} grid-cols-1 md:grid-cols-3`}>
              {newBrands.slice(0, 3).map((brand) => (
                <NewBrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </TrendingBlock>
        ) : null}

        {topOffers.length > 0 ? (
          <TrendingBlock
            title="Top member offers"
            icon={
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            viewAllHref="/browse-brands"
            viewAllLabel="View all offers →"
            hideViewAll={hideViewAll}
          >
            <div className={`${brandTileGridGapClass} grid-cols-1 md:grid-cols-3`}>
              {topOffers.slice(0, 6).map((brand, index) => (
                <div
                  key={brand.id}
                  className={index >= 3 ? "max-md:hidden" : undefined}
                >
                  <TopMemberOfferCard brand={brand} />
                </div>
              ))}
            </div>
          </TrendingBlock>
        ) : null}
      </div>
    </section>
  );
}
