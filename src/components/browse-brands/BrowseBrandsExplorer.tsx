"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
import { DiscoveryModeToggle } from "@/components/hospitality/DiscoveryModeToggle";
import { SuggestFilterInput } from "@/components/hospitality/SuggestFilterInput";
import {
  DIETARY_LIFESTYLE_ATTRIBUTES,
  flattenSubcategoryFilterGroups,
  getSubcategoryFilterGroups,
  PRIMARY_DEPARTMENTS,
} from "@/data/partner-categories";
import {
  HOSPITALITY_VENUE_TYPE_LABELS,
  NZ_REGIONS,
  normalizeNzRegion,
} from "@/lib/hospitality/constants";
import {
  listHospitalityLocalityOptionsAction,
  searchHospitalityVenuesAction,
} from "@/lib/hospitality/search-actions";
import {
  HOSPITALITY_VENUE_TYPES,
  type DiscoveryMode,
  type HospitalityVenueType,
} from "@/lib/hospitality/types";
import {
  BROWSE_PAGE_SIZE,
  type BrandCard,
  type BrandSortOption,
} from "@/lib/member/browse-brands-types";
import { searchBrandsAction } from "@/lib/member/browse-brands-actions";
import { getViewerFavoriteContextAction } from "@/lib/member/favorites-actions";

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

const LOCAL_REGION_OPTIONS = [...NZ_REGIONS, "Other regions"];
const FILTER_PEEPING_IMAGE = "/filter/peeping.png";

type BrowseBrandsExplorerProps = {
  featured: BrandCard[];
  initialExplore: BrandCard[];
  initialTotal: number;
  initialLocalExplore?: BrandCard[];
  initialLocalTotal?: number;
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
  /** Signed-in partner brand homepage — smaller filter peeping image. */
  partnerHomepage?: boolean;
  /** Skip reading URL search params (used inside Suspense fallbacks). */
  disableUrlHydration?: boolean;
};

export function BrowseBrandsExplorer({
  featured,
  initialExplore,
  initialTotal,
  initialLocalExplore = [],
  initialLocalTotal = 0,
  canFavorite,
  favoritedPartnerIds,
  initialDepartment = "",
  initialSubcategory = "",
  embedded = false,
  exploreHeading = "Explore More",
  exploreHeadingClassName = "text-2xl font-bold text-foreground",
  compactSpacing = false,
  partnerHomepage = false,
  disableUrlHydration = false,
}: BrowseBrandsExplorerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [favoriteEnabled, setFavoriteEnabled] = useState(canFavorite);
  const [favoritedIds, setFavoritedIds] = useState(favoritedPartnerIds);
  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>(() =>
    !disableUrlHydration && searchParams.get("mode")?.trim() === "local"
      ? "local"
      : "online"
  );
  const [localRegion, setLocalRegion] = useState(
    () => (!disableUrlHydration ? searchParams.get("region")?.trim() ?? "" : "")
  );
  const [localCity, setLocalCity] = useState(
    () => (!disableUrlHydration ? searchParams.get("city")?.trim() ?? "" : "")
  );
  const [localVenueType, setLocalVenueType] = useState<HospitalityVenueType | "">(() => {
    if (disableUrlHydration) return "";
    const venueTypeParam = searchParams.get("venueType")?.trim() ?? "";
    return HOSPITALITY_VENUE_TYPES.includes(venueTypeParam as HospitalityVenueType)
      ? (venueTypeParam as HospitalityVenueType)
      : "";
  });
  const [localBrands, setLocalBrands] = useState<BrandCard[]>(initialLocalExplore);
  const [localTotal, setLocalTotal] = useState(initialLocalTotal);
  const [localCityOptions, setLocalCityOptions] = useState<string[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const localSearchRequestId = useRef(0);

  useEffect(() => {
    if (canFavorite) return;

    let cancelled = false;
    void getViewerFavoriteContextAction().then((context) => {
      if (cancelled) return;
      setFavoriteEnabled(context.canFavorite);
      setFavoritedIds(context.favoritedPartnerIds);
    });

    return () => {
      cancelled = true;
    };
  }, [canFavorite]);

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

  useEffect(() => {
    if (disableUrlHydration) {
      return;
    }

    const mode = searchParams.get("mode")?.trim() === "local" ? "local" : "online";
    const region = searchParams.get("region")?.trim() ?? "";
    const city = searchParams.get("city")?.trim() ?? "";
    const venueTypeParam = searchParams.get("venueType")?.trim() ?? "";
    const venueType = HOSPITALITY_VENUE_TYPES.includes(
      venueTypeParam as HospitalityVenueType
    )
      ? (venueTypeParam as HospitalityVenueType)
      : "";
    const department = searchParams.get("department")?.trim() ?? "";
    const subcategory = searchParams.get("subcategory")?.trim() ?? "";

    setDiscoveryMode(mode);
    setLocalRegion(region);
    setLocalCity(city);
    setLocalVenueType(venueType);

    if (mode === "local") {
      return;
    }

    if (!department && !subcategory) {
      return;
    }

    setDepartments(department ? [department] : []);
    setSubcategories(subcategory ? [subcategory] : []);

    startTransition(async () => {
      const result = await searchBrandsAction({
        search: "",
        departments: department ? [department] : [],
        subcategories: subcategory ? [subcategory] : [],
        dietaryLifestyles: [],
        minDiscount: null,
        sort: "featured",
        limit: BROWSE_PAGE_SIZE,
        offset: 0,
      });

      setTotal(result.total);
      setBrands(result.brands);
    });
  }, [disableUrlHydration, searchParams]);

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

  useEffect(() => {
    let cancelled = false;
    void listHospitalityLocalityOptionsAction(localRegion || null).then((options) => {
      if (!cancelled) setLocalCityOptions(options);
    });
    return () => {
      cancelled = true;
    };
  }, [localRegion]);

  const visibleBrands = discoveryMode === "local" ? localBrands : brands;
  const visibleFeatured = discoveryMode === "local" ? [] : featured;

  const runSearch = useCallback(
    (offset: number, append: boolean, modeOverride?: DiscoveryMode) => {
      const mode = modeOverride ?? discoveryMode;

      if (mode === "local") {
        const requestId = ++localSearchRequestId.current;
        if (!append) {
          setLocalLoading(true);
        }

        void searchHospitalityVenuesAction({
          region: localRegion || null,
          city: localCity || null,
          venueType: localVenueType || null,
          sort,
          limit: BROWSE_PAGE_SIZE,
          offset,
        })
          .then((result) => {
            if (requestId !== localSearchRequestId.current) return;
            setLocalTotal(result.total);
            setLocalBrands((current) =>
              append ? [...current, ...result.brands] : result.brands
            );
          })
          .finally(() => {
            if (requestId === localSearchRequestId.current) {
              setLocalLoading(false);
            }
          });
        return;
      }

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
    [
      discoveryMode,
      localRegion,
      localCity,
      localVenueType,
      departments,
      subcategories,
      dietaryLifestyles,
      minDiscount,
      sort,
    ]
  );

  useEffect(() => {
    if (initialLocalExplore.length > 0) return;

    let cancelled = false;
    void searchHospitalityVenuesAction({
      sort: "featured",
      limit: BROWSE_PAGE_SIZE,
      offset: 0,
    }).then((result) => {
      if (cancelled) return;
      setLocalBrands((current) => (current.length > 0 ? current : result.brands));
      setLocalTotal((current) => (current > 0 ? current : result.total));
    });

    return () => {
      cancelled = true;
    };
  }, [initialLocalExplore.length]);

  function syncDiscoveryUrl(mode: DiscoveryMode) {
    if (disableUrlHydration || typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (mode === "local") {
      params.set("mode", "local");
      if (localRegion) params.set("region", localRegion);
      if (localCity) params.set("city", localCity);
      if (localVenueType) params.set("venueType", localVenueType);
    } else if (departments[0]) {
      params.set("department", departments[0]);
      if (subcategories[0]) params.set("subcategory", subcategories[0]);
    }
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    // replaceState avoids useSearchParams() suspending and remounting the
    // explorer (which discarded in-flight Visit Local results).
    window.history.replaceState(window.history.state, "", url);
  }

  function handleDiscoveryModeChange(mode: DiscoveryMode) {
    setDiscoveryMode(mode);
    syncDiscoveryUrl(mode);
    if (mode === "local" && localBrands.length === 0) {
      runSearch(0, false, "local");
    }
  }

  function handleRegionChange(nextRegion: string) {
    const trimmed = nextRegion.trim();
    if (!trimmed) {
      setLocalRegion("");
      setLocalCity("");
      return;
    }

    if (trimmed.toLowerCase() === "other regions" || trimmed.toLowerCase() === "other") {
      setLocalRegion("other");
      setLocalCity("");
      return;
    }

    setLocalRegion(normalizeNzRegion(trimmed) || trimmed);
    setLocalCity("");
  }

  const loadCitySuggestions = useCallback(async (query: string) => {
    const q =
      localRegion && localRegion !== "other"
        ? `${query}, ${localRegion}`
        : query;
    try {
      const response = await fetch(
        `/api/hospitality/geocode?q=${encodeURIComponent(q)}&limit=10`
      );
      if (!response.ok) return [];
      const payload = (await response.json()) as {
        results?: { suburb?: string; city?: string }[];
      };
      const values = new Set<string>();
      for (const result of payload.results ?? []) {
        if (result.suburb?.trim()) values.add(result.suburb.trim());
        if (result.city?.trim()) values.add(result.city.trim());
      }
      return [...values];
    } catch {
      return [];
    }
  }, [localRegion]);

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (discoveryMode === "local") {
      syncDiscoveryUrl("local");
    }
    runSearch(0, false);
  }

  const hasMore =
    discoveryMode === "local" ? localBrands.length < localTotal : brands.length < total;
  const loadedCount = discoveryMode === "local" ? localBrands.length : brands.length;

  const searchBusy = discoveryMode === "local" ? localLoading : isPending;

  useEffect(() => {
    if (discoveryMode !== "local") return;
    runSearch(0, false);
  }, [discoveryMode, localRegion, localCity, localVenueType, sort, runSearch]);

  useEffect(() => {
    if (!hasMore || searchBusy) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runSearch(loadedCount, true);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadedCount, hasMore, searchBusy, runSearch]);

  const formTopMargin = embedded
    ? ""
    : compactSpacing
      ? "mt-5 sm:mt-7 lg:mt-8"
      : "mt-10 sm:mt-14 lg:mt-16";
  const formPadding = compactSpacing ? "p-3" : "p-5";
  const filterShellClassName = embedded
    ? "relative z-40 overflow-visible"
    : `${formTopMargin} relative z-40 overflow-visible`;
  const filterFormClassName = `relative z-40 overflow-visible rounded-lg border border-border bg-background ${formPadding} shadow-sm`;
  const filterPeepingClassName = partnerHomepage
    ? "pointer-events-none absolute -top-8 left-6 z-10 block h-8 w-auto max-w-[8.4rem] object-contain object-bottom sm:-top-[2.4rem] sm:left-7 sm:h-[2.4rem] md:-top-[2.8rem] md:h-[2.8rem] lg:-top-[3.2rem] lg:left-8 lg:h-[3.2rem] lg:max-w-[11.2rem]"
    : compactSpacing
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
          <div className="mb-4">
            <DiscoveryModeToggle
              value={discoveryMode}
              onChange={handleDiscoveryModeChange}
            />
          </div>

          {discoveryMode === "local" ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-2">
              <SuggestFilterInput
                label="Region"
                value={localRegion === "other" ? "Other regions" : localRegion}
                onChange={handleRegionChange}
                options={LOCAL_REGION_OPTIONS}
                placeholder="Start typing a region"
              />

              <SuggestFilterInput
                label="City / Suburb"
                value={localCity}
                onChange={setLocalCity}
                options={localCityOptions}
                loadSuggestions={loadCitySuggestions}
                placeholder={
                  localRegion
                    ? "Start typing a city or suburb"
                    : "Select a region first"
                }
                disabled={!localRegion}
              />

              <label className="block min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Venue type
                </span>
                <select
                  value={localVenueType}
                  onChange={(event) =>
                    setLocalVenueType(event.target.value as HospitalityVenueType | "")
                  }
                  className={browseFilterSelectClass}
                >
                  <option value="">All venue types</option>
                  {HOSPITALITY_VENUE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {HOSPITALITY_VENUE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>

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
                className="fv-btn-primary inline-flex w-full shrink-0 items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 lg:w-auto"
              >
                Search
              </button>
            </div>
          ) : (
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
          )}

          {discoveryMode === "online" ? (
            <BrowseFilterTags tags={activeFilterTags} onRemove={removeFilterTag} />
          ) : null}
        </form>
      </div>

      {visibleFeatured.length > 0 ? (
        <section className={blockGap}>
          <h2 className="text-2xl font-bold text-foreground">Featured Brands</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover a selection of participating brands chosen by FoodVault.
          </p>
          <div className={`${gridGap} ${brandTileGridClass}`}>
            {visibleFeatured.map((brand) => (
              <BrowseBrandCard
                key={`featured-${brand.id}`}
                brand={brand}
                canFavorite={favoriteEnabled}
                initialFavorited={favoritedSet.has(brand.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className={blockGap}>
        {exploreHeading ? (
          <h2 className={exploreHeadingClassName}>{exploreHeading}</h2>
        ) : discoveryMode === "local" ? (
          <h2 className="text-2xl font-bold text-foreground">Local venues</h2>
        ) : null}
        {visibleBrands.length === 0 ? (
          <div className={`${gridGap} rounded-lg border border-border bg-background p-10 text-center`}>
            {discoveryMode === "local" && localLoading ? (
              <>
                <p className="text-lg font-semibold text-foreground">Loading local venues...</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Finding member offers near you.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-foreground">
                  {discoveryMode === "local"
                    ? "No venues match your filters"
                    : "No brands match your filters"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {discoveryMode === "local"
                    ? "Try another region, city, or venue type."
                    : "Try adjusting your department, diet & lifestyle, or discount filters."}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={`${exploreHeading || discoveryMode === "local" ? gridGap : "mt-0"} ${brandTileGridClass}`}>
              {visibleBrands.map((brand) => (
                <BrowseBrandCard
                  key={brand.id}
                  brand={brand}
                  canFavorite={favoriteEnabled}
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
                {searchBusy ? (
                  <p className="text-sm text-muted-foreground">
                    {discoveryMode === "local"
                      ? "Loading more venues..."
                      : "Loading more brands..."}
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
