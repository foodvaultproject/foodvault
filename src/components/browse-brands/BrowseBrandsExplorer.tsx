"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import {
  BrowseFilterTags,
  type BrowseFilterTag,
} from "@/components/browse-brands/BrowseFilterTags";
import {
  BrowseMultiSelectFilter,
  browseFilterSelectClass,
} from "@/components/browse-brands/BrowseMultiSelectFilter";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import {
  DIETARY_LIFESTYLE_ATTRIBUTES,
  flattenSubcategoryFilterGroups,
  getSubcategoryFilterGroups,
  PRIMARY_DEPARTMENTS,
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

const FILTER_PEEPING_IMAGE = "/filter/peeping.png";

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
  /** Tighter vertical rhythm for active member homepage. */
  compactSpacing?: boolean;
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
  compactSpacing = false,
}: BrowseBrandsExplorerProps) {
  const favoritedSet = useMemo(
    () => new Set(favoritedPartnerIds),
    [favoritedPartnerIds]
  );

  const [departments, setDepartments] = useState<string[]>(
    initialDepartment ? [initialDepartment] : []
  );
  const [subcategories, setSubcategories] = useState<string[]>(
    initialSubcategory ? [initialSubcategory] : []
  );
  const [dietaryLifestyles, setDietaryLifestyles] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort, setSort] = useState<BrandSortOption>("featured");

  const [brands, setBrands] = useState<BrandCard[]>(initialExplore);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const subcategoryGroups = useMemo(
    () => getSubcategoryFilterGroups(departments),
    [departments]
  );

  const subcategoryOptions = useMemo(
    () => flattenSubcategoryFilterGroups(subcategoryGroups).sort((a, b) => a.localeCompare(b)),
    [subcategoryGroups]
  );

  useEffect(() => {
    if (departments.length === 0) return;

    const validSubcategories = new Set(subcategoryOptions);
    setSubcategories((current) =>
      current.filter((subcategory) => validSubcategories.has(subcategory))
    );
  }, [departments, subcategoryOptions]);

  const activeFilterTags = useMemo(() => {
    const tags: BrowseFilterTag[] = [];

    for (const department of departments) {
      tags.push({
        id: `department-${department}`,
        label: department,
        group: "department",
        value: department,
      });
    }

    for (const subcategory of subcategories) {
      tags.push({
        id: `subcategory-${subcategory}`,
        label: subcategory,
        group: "subcategory",
        value: subcategory,
      });
    }

    for (const attribute of dietaryLifestyles) {
      tags.push({
        id: `dietary-${attribute}`,
        label: attribute,
        group: "dietary",
        value: attribute,
      });
    }

    return tags;
  }, [departments, subcategories, dietaryLifestyles]);

  function removeFilterTag(tag: BrowseFilterTag) {
    if (tag.group === "department") {
      setDepartments((current) => current.filter((value) => value !== tag.value));
      return;
    }

    if (tag.group === "subcategory") {
      setSubcategories((current) => current.filter((value) => value !== tag.value));
      return;
    }

    setDietaryLifestyles((current) => current.filter((value) => value !== tag.value));
  }

  const runSearch = useCallback(
    (offset: number, append: boolean) => {
      startTransition(async () => {
        const result = await searchBrandsAction({
          search: "",
          departments,
          subcategories,
          dietaryLifestyles,
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
    [departments, subcategories, dietaryLifestyles, minDiscount, sort]
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

  const formTopMargin = embedded
    ? ""
    : compactSpacing
      ? "mt-5 sm:mt-7 lg:mt-8"
      : "mt-10 sm:mt-14 lg:mt-16";
  const formPadding = compactSpacing ? "p-3" : "p-5";
  const filterShellClassName = embedded
    ? "relative overflow-visible"
    : `${formTopMargin} relative overflow-visible`;
  const filterFormClassName = `overflow-visible rounded-lg border border-border bg-background ${formPadding} shadow-sm`;
  const filterPeepingClassName = compactSpacing
    ? "pointer-events-none absolute -top-10 left-6 z-10 block h-10 w-auto max-w-[10.5rem] object-contain object-bottom sm:-top-12 sm:left-7 sm:h-12 md:-top-14 md:h-14 lg:-top-16 lg:left-8 lg:h-16 lg:max-w-[14rem]"
    : "pointer-events-none absolute -top-12 left-8 z-10 block h-12 w-auto max-w-[11rem] object-contain object-bottom sm:-top-14 sm:h-14 md:-top-16 md:h-16 lg:-top-[4.5rem] lg:left-8 lg:h-[4.5rem] lg:max-w-[14rem]";

  const blockGap = compactSpacing ? "mt-6" : "mt-12";
  const gridGap = compactSpacing ? "mt-3" : "mt-6";

  return (
    <>
      <div className={filterShellClassName}>
        <img
          src={FILTER_PEEPING_IMAGE}
          alt=""
          aria-hidden="true"
          className={filterPeepingClassName}
        />
        <form onSubmit={handleSearchSubmit} className={filterFormClassName}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-2">
            <div className="grid grid-cols-2 gap-3 lg:contents">
              <BrowseMultiSelectFilter
                label="Department"
                placeholder="All Departments"
                options={PRIMARY_DEPARTMENTS}
                selected={departments}
                onChange={setDepartments}
              />

              <BrowseMultiSelectFilter
                label="Subcategory"
                placeholder="All Subcategories"
                options={subcategoryOptions}
                optionGroups={subcategoryGroups}
                selected={subcategories}
                onChange={setSubcategories}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:contents">
              <BrowseMultiSelectFilter
                label="Diet & Lifestyle"
                placeholder="All Attributes"
                options={DIETARY_LIFESTYLE_ATTRIBUTES}
                selected={dietaryLifestyles}
                onChange={setDietaryLifestyles}
              />

              <label className="block min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Member Discount
                </span>
                <select
                  value={minDiscount}
                  onChange={(event) => setMinDiscount(Number(event.target.value))}
                  className={browseFilterSelectClass}
                >
                  {discountOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Sort By
              </span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as BrandSortOption)}
                className={browseFilterSelectClass}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="fv-btn-primary inline-flex w-full shrink-0 items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60 lg:w-auto"
            >
              {isPending ? "Searching..." : "Search"}
            </button>
          </div>

          <BrowseFilterTags tags={activeFilterTags} onRemove={removeFilterTag} />
        </form>
      </div>

      {featured.length > 0 ? (
        <section className={blockGap}>
          <h2 className="text-2xl font-bold text-foreground">Featured Brands</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover a selection of participating brands chosen by FoodVault.
          </p>
          <div className={`${gridGap} ${brandTileGridClass}`}>
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

      <section className={blockGap}>
        {exploreHeading ? (
          <h2 className={exploreHeadingClassName}>{exploreHeading}</h2>
        ) : null}
        {brands.length === 0 ? (
          <div className={`${gridGap} rounded-lg border border-border bg-background p-10 text-center`}>
            <p className="text-lg font-semibold text-foreground">
              No brands match your filters
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your department, diet &amp; lifestyle, or discount filters.
            </p>
          </div>
        ) : (
          <>
            <div className={`${exploreHeading ? gridGap : "mt-0"} ${brandTileGridClass}`}>
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
                className={`${compactSpacing ? "mt-4" : "mt-8"} flex min-h-12 items-center justify-center`}
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
