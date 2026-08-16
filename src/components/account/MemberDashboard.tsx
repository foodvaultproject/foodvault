import Link from "next/link";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { MemberDashboardFavorites } from "@/components/account/MemberDashboardFavorites";
import { MemberQuickActionCards } from "@/components/member/MemberQuickActionCards";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { FavoritePartner } from "@/lib/member/favorites-queries";

type MemberDashboardProps = {
  brands: BrandCard[];
  favorites: FavoritePartner[];
  canFavorite: boolean;
  favoritedPartnerIds: string[];
  error?: string | null;
};

export function MemberDashboard({
  brands,
  favorites,
  canFavorite,
  favoritedPartnerIds,
  error,
}: MemberDashboardProps) {
  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:py-5">
        <h1 className="text-[18px] font-bold tracking-tight text-foreground">
          My Dashboard
        </h1>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="mt-6">
          <h2 className="text-[14px] font-bold text-foreground">Quick Actions</h2>
          <div className="mt-2.5">
            <MemberQuickActionCards />
          </div>
        </section>

        <MemberDashboardFavorites initialFavorites={favorites} />

        {brands.length > 0 ? (
          <section className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[14px] font-bold text-foreground">New This Week</h2>
              <Link href="/browse-brands" className="text-sm font-semibold text-primary hover:text-primary-hover">
                View All
              </Link>
            </div>
            <div className={`mt-3.5 ${brandTileGridClass}`}>
              {brands.map((brand) => (
                <BrowseBrandCard
                  key={brand.id}
                  brand={brand}
                  canFavorite={canFavorite}
                  initialFavorited={favoritedPartnerIds.includes(brand.id)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
