"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { HomeTrendingSearches } from "@/components/home/HomeTrendingSearches";
import {
  PARTNER_CATEGORY_TAXONOMY,
  PRIMARY_DEPARTMENTS,
  type PrimaryDepartment,
} from "@/data/partner-categories";
import {
  BROWSE_PAGE_SIZE,
  type BrandCard,
  type BrandSortOption,
} from "@/lib/member/browse-brands-types";
import { searchBrandsAction } from "@/lib/member/browse-brands-actions";

const sortOptions: { value: BrandSortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "highest-discount", label: "Highest Discount" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "newest", label: "Newest" },
  { value: "recently-updated", label: "Recently Updated" },
];

const discountOptions = [
  { value: 0, label: "Any" },
  { value: 10, label: "10% or more" },
  { value: 15, label: "15% or more" },
  { value: 20, label: "20% or more" },
  { value: 25, label: "25% or more" },
];

const selectClass =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

type BrowseBrandsExplorerProps = {
  featured: BrandCard[];
  initialExplore: BrandCard[];
  initialTotal: number;
  canFavorite: boolean;
  favoritedPartnerIds: string[];
  initialDepartment?: string;
  initialSubcategory?: string;
  /** Tighter top spacing when embedded on the partner homepage. */
  embedded?: boolean;
  /** Heading for the main brand-grid section. Defaults to "Explore More". */
  exploreHeading?: string;
  /** Class names for the main brand-grid heading. */
  exploreHeadingClassName?: string;
  /** Show trending search chips below the filter form (partner homepage). */
  showTrendingSearches?: boolean;
};

export function BrowseBrandsExplorer({
  featured,
  initialExplore,
  initialTotal,
  canFavorite,
  favoritedPartnerIds,
  initialDepartment = "",
  initialSubcategory = "",
  embedded = false,
  exploreHeading = "Explore More",
  exploreHeadingClassName = "text-2xl font-bold text-foreground",
  showTrendingSearches = false,
}: BrowseBrandsExplorerProps) {
  const favoritedSet = useMemo(
    () => new Set(favoritedPartnerIds),
    [favoritedPartnerIds]
  );

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState(initialDepartment);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort, setSort] = useState<BrandSortOption>("featured");

  const [brands, setBrands] = useState<BrandCard[]>(initialExplore);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const subcategoryOptions = department
    ? PARTNER_CATEGORY_TAXONOMY[department as PrimaryDepartment] ?? []
    : [];

  const runSearch = useCallback(
    (offset: number, append: boolean) => {
      startTransition(async () => {
        const result = await searchBrandsAction({
          search,
          department: department || null,
          subcategory: subcategory || null,
          minDiscount: minDiscount || null,
          sort,
          limit: BROWSE_PAGE_SIZE,
          offset,
        });

        setTotal(result.total);
        setBrands((current) =>
          append ? [...current, ...result.brands] : result.brands
        );
      });
    },
    [search, department, subcategory, minDiscount, sort]
  );

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    runSearch(0, false);
  }

  const hasMore = brands.length < total;

  useEffect(() => {
    if (!hasMore || isPending) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runSearch(brands.length, true);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [brands.length, hasMore, isPending, runSearch]);

  const formClassName = embedded
    ? "rounded-lg border border-border bg-background p-5 shadow-sm"
    : "mt-10 rounded-lg border border-border bg-background p-5 shadow-sm sm:mt-14 lg:mt-16";

  return (
    <>
      <form onSubmit={handleSearchSubmit} className={formClassName}>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Search Brands
            </span>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search brands or products..."
                className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Department
            </span>
            <select
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                setSubcategory("");
              }}
              className={selectClass}
            >
              <option value="">All Departments</option>
              {PRIMARY_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Subcategory
            </span>
            <select
              value={subcategory}
              onChange={(event) => setSubcategory(event.target.value)}
              disabled={!department}
              className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <option value="">All Subcategories</option>
              {subcategoryOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Member Discount
            </span>
            <select
              value={minDiscount}
              onChange={(event) => setMinDiscount(Number(event.target.value))}
              className={selectClass}
            >
              {discountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Sort By
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as BrandSortOption)}
              className={selectClass}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
            >
              {isPending ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {showTrendingSearches ? (
        <HomeTrendingSearches
          keepBrowseOnHomepage
          hideViewAll
          className="mt-6 rounded-lg border border-border bg-background p-5 shadow-sm"
        />
      ) : null}

      {featured.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">Featured Brands</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover a selection of participating brands chosen by FoodVault.
          </p>
          <div className={`mt-6 ${brandTileGridClass}`}>
            {featured.map((brand) => (
              <BrowseBrandCard
                key={`featured-${brand.id}`}
                brand={brand}
                canFavorite={canFavorite}
                initialFavorited={favoritedSet.has(brand.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className={exploreHeadingClassName}>{exploreHeading}</h2>
        {brands.length === 0 ? (
          <div className="mt-6 rounded-lg border border-border bg-background p-10 text-center">
            <p className="text-lg font-semibold text-foreground">
              No brands match your filters
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search, department or discount filters.
            </p>
          </div>
        ) : (
          <>
            <div className={`mt-6 ${brandTileGridClass}`}>
              {brands.map((brand) => (
                <BrowseBrandCard
                  key={brand.id}
                  brand={brand}
                  canFavorite={canFavorite}
                  initialFavorited={favoritedSet.has(brand.id)}
                />
              ))}
            </div>

            {hasMore ? (
              <div
                ref={loadMoreRef}
                className="mt-8 flex min-h-12 items-center justify-center"
                aria-live="polite"
              >
                {isPending ? (
                  <p className="text-sm text-muted-foreground">Loading more brands...</p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
