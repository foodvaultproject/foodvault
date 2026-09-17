"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/media/SafeImage";
import { GroceryListButton } from "@/components/pantry/GroceryListButton";
import { VaultMarketCartButton } from "@/components/pantry/VaultMarketCartButton";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import {
  catalogSlug,
  getVaultMarketBrowseDepartments,
  pantryDepartmentPath,
  pantryProductPath,
  resolveProductDepartment,
  resolveProductSpecific,
  resolveProductSubcategory,
  suggestCatalogSearch,
  type VaultMarketBrowseDepartment,
} from "@/lib/commerce/catalog";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultProduct } from "@/types/commerce";

type BrowseStep = "departments" | "subcategories" | "specifics";

function canHoverFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function departmentHasProducts(
  departmentSlug: string,
  subcategorySlug: string | undefined,
  counts: Map<string, Set<string>>
) {
  const subcategories = counts.get(departmentSlug);
  if (!subcategories) return false;
  return subcategorySlug ? subcategories.has(subcategorySlug) : true;
}

export function PantryMarketHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products, liveQuery, setLiveQuery } = usePantryMarket();
  const browseId = useId();
  const searchId = useId();
  const browseRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const replaceTimer = useRef<number | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseStep, setBrowseStep] = useState<BrowseStep>("departments");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [activeDepartment, setActiveDepartment] = useState(0);
  const [activeSubcategory, setActiveSubcategory] = useState(0);
  const departments = useMemo(() => getVaultMarketBrowseDepartments(), []);
  const suggestions = useMemo(
    () => suggestCatalogSearch(products, liveQuery),
    [liveQuery, products]
  );

  const productCounts = useMemo(() => {
    const counts = new Map<string, Set<string>>();
    for (const product of products) {
      const department = catalogSlug(resolveProductDepartment(product));
      const subcategory = catalogSlug(resolveProductSubcategory(product));
      const existing = counts.get(department) ?? new Set<string>();
      existing.add(subcategory);
      if (resolveProductSpecific(product)) {
        existing.add(`${subcategory}:${catalogSlug(resolveProductSpecific(product))}`);
      }
      counts.set(department, existing);
    }
    return counts;
  }, [products]);

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    if (urlQuery && !liveQuery) setLiveQuery(urlQuery);
    // Initialize from the URL once when landing on the catalog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!browseRef.current?.contains(target)) {
        setBrowseOpen(false);
      }
      if (!searchRef.current?.contains(target)) {
        setSearchOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBrowseOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
      if (replaceTimer.current) window.clearTimeout(replaceTimer.current);
    };
  }, []);

  useEffect(() => {
    setActiveSuggestion(0);
  }, [liveQuery]);

  useEffect(() => {
    if (!browseOpen) {
      setBrowseStep("departments");
      setActiveSubcategory(0);
    }
  }, [browseOpen]);

  function closeBrowse() {
    setBrowseOpen(false);
    setLiveQuery("");
  }

  function goToCatalog(nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    else params.delete("q");
    const query = params.toString();
    router.push(query ? `/pantry?${query}` : "/pantry");
  }

  function handleSearchChange(value: string) {
    setLiveQuery(value);
    setSearchOpen(value.trim().length > 0);
    if (pathname !== "/pantry") return;
    if (replaceTimer.current) window.clearTimeout(replaceTimer.current);
    replaceTimer.current = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      const query = params.toString();
      router.replace(query ? `/pantry?${query}` : "/pantry", { scroll: false });
    }, 250);
  }

  function applyBrandSearch(brand: string) {
    if (replaceTimer.current) window.clearTimeout(replaceTimer.current);
    setLiveQuery(brand);
    goToCatalog(brand);
    setSearchOpen(false);
    setBrowseOpen(false);
  }

  function applyProductSearch(product: FoodVaultProduct) {
    if (replaceTimer.current) window.clearTimeout(replaceTimer.current);
    setSearchOpen(false);
    setBrowseOpen(false);
    router.push(pantryProductPath(product));
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    const selected = suggestions[activeSuggestion];
    if (searchOpen && selected) {
      if (selected.kind === "brand") applyBrandSearch(selected.brand);
      else applyProductSearch(selected.product);
      return;
    }
    goToCatalog(liveQuery);
    setSearchOpen(false);
    setBrowseOpen(false);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSuggestion((current) =>
        current === 0 ? suggestions.length - 1 : current - 1
      );
    }
  }

  function selectDepartment(
    department: VaultMarketBrowseDepartment,
    index: number,
    navigate: boolean
  ) {
    setActiveDepartment(index);
    setActiveSubcategory(0);
    if (navigate) {
      router.push(pantryDepartmentPath(department.department));
      closeBrowse();
      return;
    }
    setBrowseStep("subcategories");
  }

  function selectSubcategory(
    department: VaultMarketBrowseDepartment,
    subcategoryIndex: number,
    navigate: boolean
  ) {
    const subcategory = department.subcategories[subcategoryIndex];
    setActiveSubcategory(subcategoryIndex);
    if (navigate) {
      router.push(pantryDepartmentPath(department.department, subcategory.label));
      closeBrowse();
      return;
    }
    setBrowseStep("specifics");
  }

  const active = departments[activeDepartment];
  const activeSub = active?.subcategories[activeSubcategory];

  const suggestionListId = `${searchId}-suggestions`;
  const showSuggestions = searchOpen && suggestions.length > 0;

  return (
    <div className="sticky top-[calc(4.25rem+22px)] z-30 border-b border-border bg-background shadow-sm md:top-[calc(8rem+26px)]">
      <div className="relative" ref={searchRef}>
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:gap-4 lg:px-8">
        <div className="relative shrink-0" ref={browseRef}>
          <button
            type="button"
            aria-expanded={browseOpen}
            aria-controls={browseId}
            onClick={() => setBrowseOpen((open) => !open)}
            onMouseEnter={() => {
              if (canHoverFinePointer()) setBrowseOpen(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-vm-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-vm-surface sm:px-4"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            Browse
            <ChevronDown
              className={`h-4 w-4 transition-transform ${browseOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          <div
            id={browseId}
            hidden={!browseOpen}
            onMouseLeave={() => {
              if (canHoverFinePointer()) setBrowseOpen(false);
            }}
            className="absolute left-0 z-40 mt-2 w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-background shadow-xl md:w-[min(54rem,calc(100vw-2rem))]"
          >
            <div className="md:hidden">
              {browseStep !== "departments" ? (
                <button
                  type="button"
                  onClick={() =>
                    setBrowseStep(browseStep === "specifics" ? "subcategories" : "departments")
                  }
                  className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-sm font-semibold text-foreground"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {browseStep === "specifics" ? activeSub?.label : active?.department}
                </button>
              ) : (
                <p className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Categories
                </p>
              )}

              <ul className="max-h-[min(24rem,60vh)] overflow-y-auto">
                {browseStep === "departments"
                  ? departments.map((department, index) => {
                      const inStock = departmentHasProducts(department.slug, undefined, productCounts);
                      return (
                        <li key={department.slug}>
                          <button
                            type="button"
                            onClick={() => selectDepartment(department, index, false)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground"
                          >
                            <span className="min-w-0 flex-1 whitespace-normal break-words">
                              {department.department}
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              {inStock ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-vm-primary" />
                              ) : null}
                              <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
                            </span>
                          </button>
                        </li>
                      );
                    })
                  : null}

                {browseStep === "subcategories" && active
                  ? [
                      <li key="shop-all-department">
                        <Link
                          href={pantryDepartmentPath(active.department)}
                          onClick={closeBrowse}
                          className="block px-4 py-3 text-sm font-semibold text-vm-primary"
                        >
                          Shop all {active.department}
                        </Link>
                      </li>,
                      ...active.subcategories.map((subcategory, index) => {
                        const inStock = departmentHasProducts(
                          active.slug,
                          subcategory.slug,
                          productCounts
                        );
                        return (
                          <li key={subcategory.slug}>
                            <button
                              type="button"
                              onClick={() => selectSubcategory(active, index, false)}
                              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm ${
                                inStock ? "font-medium text-foreground" : "text-muted"
                              }`}
                            >
                              <span className="min-w-0 flex-1 whitespace-normal break-words">
                                {subcategory.label}
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                            </button>
                          </li>
                        );
                      }),
                    ]
                  : null}

                {browseStep === "specifics" && active && activeSub
                  ? [
                      <li key="shop-all-subcategory">
                        <Link
                          href={pantryDepartmentPath(active.department, activeSub.label)}
                          onClick={closeBrowse}
                          className="block px-4 py-3 text-sm font-semibold text-vm-primary"
                        >
                          Shop all {activeSub.label}
                        </Link>
                      </li>,
                      ...activeSub.specifics.map((specific) => (
                        <li key={specific.slug}>
                          <Link
                            href={pantryDepartmentPath(
                              active.department,
                              activeSub.label,
                              specific.label
                            )}
                            onClick={closeBrowse}
                            className="block px-4 py-3 text-sm text-foreground"
                          >
                            <span className="block whitespace-normal break-words">{specific.label}</span>
                          </Link>
                        </li>
                      )),
                    ]
                  : null}
              </ul>
            </div>

            <div className="hidden grid-cols-[13rem_14rem_1fr] md:grid">
              <ul className="max-h-[24rem] overflow-y-auto border-r border-border bg-surface">
                {departments.map((department, index) => {
                  const inStock = departmentHasProducts(department.slug, undefined, productCounts);
                  return (
                    <li key={department.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => {
                          setActiveDepartment(index);
                          setActiveSubcategory(0);
                        }}
                        onFocus={() => {
                          setActiveDepartment(index);
                          setActiveSubcategory(0);
                        }}
                        onClick={() => selectDepartment(department, index, true)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                          index === activeDepartment
                            ? "bg-vm-primary/10 font-semibold text-vm-primary"
                            : "text-foreground hover:bg-surface"
                        }`}
                      >
                        <span className="whitespace-normal break-words">{department.department}</span>
                        {inStock ? (
                          <span className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-vm-primary" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <ul className="max-h-[24rem] overflow-y-auto border-r border-border p-2">
                {active?.subcategories.map((subcategory, index) => {
                  const inStock = departmentHasProducts(active.slug, subcategory.slug, productCounts);
                  return (
                    <li key={subcategory.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveSubcategory(index)}
                        onFocus={() => setActiveSubcategory(index)}
                        onClick={() => selectSubcategory(active, index, true)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-vm-primary/10 hover:text-vm-primary ${
                          index === activeSubcategory
                            ? "bg-vm-primary/10 font-semibold text-vm-primary"
                            : inStock
                              ? "font-medium text-foreground"
                              : "text-muted"
                        }`}
                      >
                        <span className="whitespace-normal break-words">{subcategory.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="max-h-[24rem] overflow-y-auto p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  {activeSub?.label ?? active?.department}
                </p>
                <ul className="mt-3 grid grid-cols-1 gap-1">
                  {activeSub?.specifics.map((specific) => (
                    <li key={specific.slug}>
                      <Link
                        href={pantryDepartmentPath(
                          active.department,
                          activeSub.label,
                          specific.label
                        )}
                        onClick={closeBrowse}
                        className="block rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-vm-primary/10 hover:text-vm-primary"
                      >
                        <span className="whitespace-normal break-words">{specific.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="relative min-w-0 flex-1"
          role="search"
          aria-label="Search Vault Market products"
        >
          <label htmlFor={searchId} className="sr-only">
            Search products by name, brand, or SKU
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls={suggestionListId}
              aria-activedescendant={
                showSuggestions ? `${suggestionListId}-${activeSuggestion}` : undefined
              }
              autoComplete="off"
              value={liveQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products, brands or SKU"
              className="h-11 w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-light transition-[border-color,box-shadow] duration-200 focus:border-vm-primary focus:outline-none focus:ring-2 focus:ring-vm-primary/20 sm:pr-4"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
          <GroceryListButton />
          <VaultMarketCartButton />
        </div>
      </div>
          {showSuggestions ? (
            <ul
              id={suggestionListId}
              role="listbox"
              aria-label="Search suggestions"
              className="absolute left-0 right-0 z-50 mt-0 max-h-[min(22rem,60vh)] w-full max-w-full overflow-y-auto border-y border-border bg-background py-1 shadow-xl"
            >
              {suggestions.map((suggestion, index) => {
                const activeItem = index === activeSuggestion;
                if (suggestion.kind === "brand") {
                  return (
                    <li
                      key={`brand-${suggestion.brand}`}
                      id={`${suggestionListId}-${index}`}
                      role="option"
                      aria-selected={activeItem}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setActiveSuggestion(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyBrandSearch(suggestion.brand)}
                        className={`flex w-full flex-row items-center gap-3 p-3 text-left text-sm ${
                          activeItem ? "bg-vm-primary/10 text-vm-primary" : "text-foreground"
                        }`}
                      >
                        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                        <span className="min-w-0 flex-1 break-words text-left">
                          Search <span className="font-semibold">{suggestion.brand}</span>
                        </span>
                      </button>
                    </li>
                  );
                }

                return (
                  <li
                    key={suggestion.product.id}
                    id={`${suggestionListId}-${index}`}
                    role="option"
                    aria-selected={activeItem}
                  >
                    <Link
                      href={pantryProductPath(suggestion.product)}
                      onMouseEnter={() => setActiveSuggestion(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        if (replaceTimer.current) window.clearTimeout(replaceTimer.current);
                        setSearchOpen(false);
                        setBrowseOpen(false);
                      }}
                      className={`flex w-full flex-row items-center gap-3 p-3 text-left ${
                        activeItem ? "bg-vm-primary/10" : "bg-background"
                      }`}
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface">
                        <SafeImage
                          src={suggestion.product.image_url ?? ""}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                          fallbackVariant="muted"
                        />
                      </span>
                      <span className="min-w-0 flex-1 break-words text-left">
                        <span className="block text-sm font-semibold leading-snug text-foreground">
                          {suggestion.product.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs leading-snug text-muted">
                          {suggestion.product.description?.trim()
                            || suggestion.product.brand}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-vm-primary">
                        {formatNzPrice(suggestion.product.member_price)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
      </div>
    </div>
  );
}
