"use client";

import { ChevronDown, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { GroceryListButton } from "@/components/pantry/GroceryListButton";
import { VaultMarketCartButton } from "@/components/pantry/VaultMarketCartButton";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import {
  catalogSlug,
  getVaultMarketBrowseDepartments,
  pantryDepartmentPath,
  resolveProductDepartment,
  resolveProductSubcategory,
} from "@/lib/commerce/catalog";

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
  const replaceTimer = useRef<number | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState(0);
  const departments = useMemo(() => getVaultMarketBrowseDepartments(), []);

  const productCounts = useMemo(() => {
    const counts = new Map<string, Set<string>>();
    for (const product of products) {
      const department = catalogSlug(resolveProductDepartment(product));
      const subcategory = catalogSlug(resolveProductSubcategory(product));
      const existing = counts.get(department) ?? new Set<string>();
      existing.add(subcategory);
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
      if (!browseRef.current?.contains(event.target as Node)) {
        setBrowseOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setBrowseOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
      if (replaceTimer.current) window.clearTimeout(replaceTimer.current);
    };
  }, []);

  function goToCatalog(nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    else params.delete("q");
    const query = params.toString();
    router.push(query ? `/pantry?${query}` : "/pantry");
  }

  function handleSearchChange(value: string) {
    setLiveQuery(value);
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

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    goToCatalog(liveQuery);
    setBrowseOpen(false);
  }

  const active = departments[activeDepartment];

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-4 lg:px-8">
        <div className="relative shrink-0" ref={browseRef}>
          <button
            type="button"
            aria-expanded={browseOpen}
            aria-controls={browseId}
            onClick={() => setBrowseOpen((open) => !open)}
            onMouseEnter={() => {
              if (window.matchMedia("(hover: hover)").matches) setBrowseOpen(true);
            }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-vm-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-vm-surface lg:w-auto"
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
              if (window.matchMedia("(hover: hover)").matches) setBrowseOpen(false);
            }}
            className="absolute left-0 z-40 mt-2 w-[min(100vw-2rem,42rem)] overflow-hidden rounded-lg border border-border bg-background shadow-xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[13rem_1fr]">
              <ul className="max-h-[24rem] overflow-y-auto border-b border-border bg-surface sm:border-b-0 sm:border-r">
                {departments.map((department, index) => {
                  const inStock = departmentHasProducts(
                    department.slug,
                    undefined,
                    productCounts
                  );
                  return (
                    <li key={department.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveDepartment(index)}
                        onFocus={() => setActiveDepartment(index)}
                        onClick={() => {
                          router.push(pantryDepartmentPath(department.department));
                          setBrowseOpen(false);
                          setLiveQuery("");
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                          index === activeDepartment
                            ? "bg-vm-primary/10 font-semibold text-vm-primary"
                            : "text-foreground hover:bg-surface"
                        }`}
                      >
                        {department.department}
                        {inStock ? (
                          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-vm-primary" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="max-h-[24rem] overflow-y-auto p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  {active?.department}
                </p>
                <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {active?.subcategories.map((subcategory) => {
                    const inStock = departmentHasProducts(
                      active.slug,
                      subcategory.slug,
                      productCounts
                    );
                    return (
                      <li key={subcategory.slug}>
                        <Link
                          href={pantryDepartmentPath(active.department, subcategory.label)}
                          onClick={() => {
                            setBrowseOpen(false);
                            setLiveQuery("");
                          }}
                          className={`block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-vm-primary/10 hover:text-vm-primary ${
                            inStock ? "font-medium text-foreground" : "text-muted"
                          }`}
                        >
                          {subcategory.label}
                        </Link>
                      </li>
                    );
                  })}
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
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={liveQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search products, brands or SKU"
            className="h-11 w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-light transition-[border-color,box-shadow] duration-200 focus:border-vm-primary focus:outline-none focus:ring-2 focus:ring-vm-primary/20"
          />
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <GroceryListButton />
          <VaultMarketCartButton />
        </div>
      </div>
    </div>
  );
}
