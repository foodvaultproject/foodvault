import Link from "next/link";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { SECTION_PY_HOME } from "@/components/home/section-spacing";
import type { BrandCard } from "@/lib/member/browse-brands-types";

type HomeFeaturedBrandsProps = {
  brands: BrandCard[];
  canFavorite: boolean;
  favoritedPartnerIds: string[];
};

export function HomeFeaturedBrands({
  brands,
  canFavorite,
  favoritedPartnerIds,
}: HomeFeaturedBrandsProps) {
  if (brands.length === 0) return null;

  const displayBrands = brands.slice(0, 12);
  const favoritedSet = new Set(favoritedPartnerIds);

  return (
    <section className={`bg-surface-lavender/40 ${SECTION_PY_HOME}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Top Brands. Exclusive Member Prices.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Save on your favourite New Zealand brands with exclusive member-only pricing.
            </p>
          </div>
          <Link
            href="/browse-brands"
            className="hidden shrink-0 text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary-hover sm:inline-flex"
          >
            View all brands →
          </Link>
        </div>

        <div className={`mt-5 ${brandTileGridClass}`}>
          {displayBrands.map((brand) => (
            <BrowseBrandCard
              key={brand.id}
              brand={brand}
              canFavorite={canFavorite}
              initialFavorited={favoritedSet.has(brand.id)}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/browse-brands"
            className="inline-flex items-center justify-center rounded-sm border border-primary px-6 py-3 text-sm font-medium text-primary transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-primary/5"
          >
            Explore Brands
          </Link>
        </div>
      </div>
    </section>
  );
}
