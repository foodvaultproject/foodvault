"use client";

import { useMemo, useState } from "react";
import {
  DiscoverMoreCard,
  FavoritePartnerCard,
  FavoritesEmptyState,
} from "@/components/favorites/FavoritePartnerCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { parseDiscountSortValue } from "@/lib/member/favorites-utils";
import type { FavoritePartner } from "@/lib/member/favorites-queries";

const sortOptions = [
  { value: "recently-saved", label: "Recently Saved" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "highest-discount", label: "Highest Discount" },
  { value: "recently-updated", label: "Recently Updated" },
  { value: "newest-partner", label: "Newest Partner" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

type MemberFavoritesViewProps = {
  initialFavorites: FavoritePartner[];
};

export function MemberFavoritesView({ initialFavorites }: MemberFavoritesViewProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("recently-saved");

  const filteredFavorites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let items = favorites;

    if (query) {
      items = items.filter(
        (partner) =>
          partner.businessName.toLowerCase().includes(query) ||
          partner.keywords.includes(query) ||
          (partner.shortDescription?.toLowerCase().includes(query) ?? false) ||
          (partner.primaryCategory?.toLowerCase().includes(query) ?? false)
      );
    }

    const sorted = [...items];

    switch (sortBy) {
      case "alphabetical":
        sorted.sort((a, b) => a.businessName.localeCompare(b.businessName));
        break;
      case "highest-discount":
        sorted.sort(
          (a, b) =>
            parseDiscountSortValue(b.discountLabel) -
            parseDiscountSortValue(a.discountLabel)
        );
        break;
      case "recently-updated":
        sorted.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case "newest-partner":
        sorted.sort(
          (a, b) =>
            new Date(b.partnerCreatedAt).getTime() -
            new Date(a.partnerCreatedAt).getTime()
        );
        break;
      case "recently-saved":
      default:
        sorted.sort(
          (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
        break;
    }

    return sorted;
  }, [favorites, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:py-8">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Favorites
            </h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {favorites.length} saved
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Quickly access your saved food and beverage businesses.
          </p>
        </header>

        {favorites.length > 0 ? (
          <>
            <section className="mt-8 space-y-4">
              <label className="relative block">
                <span className="sr-only">Search your favourite brands</span>
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
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
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search your favourite brands..."
                  className="w-full rounded-md border border-border bg-background py-3.5 pl-12 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {filteredFavorites.length} brand
                  {filteredFavorites.length === 1 ? "" : "s"} shown
                </p>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Sort by:
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortValue)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {filteredFavorites.length > 0 ? (
              <section className={`mt-8 ${brandTileGridClass}`}>
                {filteredFavorites.map((partner) => (
                  <FavoritePartnerCard
                    key={partner.favoriteId}
                    partner={partner}
                    onRemoved={(partnerId) =>
                      setFavorites((current) =>
                        current.filter((item) => item.partnerId !== partnerId)
                      )
                    }
                  />
                ))}
                <DiscoverMoreCard />
              </section>
            ) : (
              <div className="mt-8 rounded-lg border border-border bg-background p-8 text-center">
                <p className="text-muted-foreground">
                  No saved brands match your search. Try another keyword.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-10">
            <FavoritesEmptyState />
          </div>
        )}
      </div>
    </div>
  );
}
