"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DiscoverMoreCard,
  FavoritePartnerCard,
  FavoritesEmptyState,
} from "@/components/favorites/FavoritePartnerCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { MEMBER_FAVORITES_PATH } from "@/lib/member/paths";
import type { FavoritePartner } from "@/lib/member/favorites-queries";

type MemberDashboardFavoritesProps = {
  initialFavorites: FavoritePartner[];
};

export function MemberDashboardFavorites({
  initialFavorites,
}: MemberDashboardFavoritesProps) {
  const [favorites, setFavorites] = useState(initialFavorites);

  const sortedFavorites = useMemo(
    () =>
      [...favorites].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      ),
    [favorites]
  );

  return (
    <section className="mt-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[14px] font-bold text-foreground">My Favorites</h2>
        {favorites.length > 0 ? (
          <Link
            href={MEMBER_FAVORITES_PATH}
            className="text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View All
          </Link>
        ) : null}
      </div>

      {favorites.length > 0 ? (
        <div className={`mt-3.5 ${brandTileGridClass}`}>
          {sortedFavorites.map((partner) => (
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
        </div>
      ) : (
        <div className="mt-3.5">
          <FavoritesEmptyState />
        </div>
      )}
    </section>
  );
}
