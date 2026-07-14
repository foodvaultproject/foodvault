import Link from "next/link";
import type { ReactNode } from "react";
import { BrandOfferBadge } from "@/components/home/BrandOfferBadge";
import { SECTION_PY_HOME_PARTNER, SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";
import type { BrandCard } from "@/lib/member/browse-brands-types";

type HomeTrendingSectionProps = {
  trending: BrandCard[];
  newBrands: BrandCard[];
  topOffers: BrandCard[];
  /** Hide the "View all" links that navigate to the standalone Discover page. */
  hideViewAll?: boolean;
  compactSpacing?: boolean;
};

type TrendingColumnProps = {
  title: string;
  icon: ReactNode;
  brands: BrandCard[];
  viewAllHref: string;
  viewAllLabel: string;
  hideViewAll?: boolean;
};

function TrendingBrandRow({ brand }: { brand: BrandCard }) {
  const category = brand.departments[0] ?? brand.department ?? "Brand";

  return (
    <Link
      href={partnerProfilePathFromSlug(brand.slug)}
      className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-surface-lavender/60"
    >
      <PartnerLogo
        src={brand.logoUrl}
        originalSrc={brand.logoOriginalUrl}
        alt=""
        businessName={brand.businessName}
        size="xs"
        bordered
        crop={brand.logoCrop}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
          {brand.businessName}
        </p>
        <p className="truncate text-xs text-muted-foreground">{category}</p>
      </div>
      <BrandOfferBadge
        discountPercent={brand.discountPercent}
        discountLabel={brand.discountLabel}
        className="shrink-0"
      />
    </Link>
  );
}

function TrendingColumn({
  title,
  icon,
  brands,
  viewAllHref,
  viewAllLabel,
  hideViewAll = false,
}: TrendingColumnProps) {
  if (brands.length === 0) return null;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-background p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-card sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>

      <div className="space-y-1">
        {brands.slice(0, 5).map((brand) => (
          <TrendingBrandRow key={brand.id} brand={brand} />
        ))}
      </div>

      {hideViewAll ? null : (
        <Link
          href={viewAllHref}
          className="mt-3 text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary-hover"
        >
          {viewAllLabel}
        </Link>
      )}
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

  return (
    <section
      className={`bg-surface-lavender ${
        compactSpacing ? SECTION_PY_HOME_PARTNER : SECTION_PY_HOME_REFINE
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-4 md:grid-cols-3 ${compactSpacing ? "md:gap-2.5" : "md:gap-5"}`}>
          <TrendingColumn
            title="Trending this week"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            }
            brands={trending}
            viewAllHref="/browse-brands"
            viewAllLabel="View all trending →"
            hideViewAll={hideViewAll}
          />
          <TrendingColumn
            title="New brands"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            }
            brands={newBrands}
            viewAllHref="/browse-brands"
            viewAllLabel="View all new brands →"
            hideViewAll={hideViewAll}
          />
          <TrendingColumn
            title="Top member offers"
            icon={
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            brands={topOffers}
            viewAllHref="/browse-brands"
            viewAllLabel="View all offers →"
            hideViewAll={hideViewAll}
          />
        </div>
      </div>
    </section>
  );
}
