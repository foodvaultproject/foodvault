"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import { getBrandDiscountPercent } from "@/components/browse-brands/BrandTileDiscountBadge";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { FavoritePartner } from "@/lib/member/favorites-queries";

type FavoritePartnerCardProps = {
  partner: FavoritePartner;
  onRemoved: (partnerId: string) => void;
};

function favoritePartnerToBrandCard(partner: FavoritePartner): BrandCard {
  return {
    id: partner.partnerId,
    businessName: partner.businessName,
    slug: partner.slug,
    shortDescription: partner.shortDescription,
    department: partner.primaryCategory,
    departments: partner.primaryCategory ? [partner.primaryCategory] : [],
    subcategories: [],
    offerType: null,
    discountLabel: partner.discountLabel,
    discountPercent: getBrandDiscountPercent({
      discountPercent: null,
      discountLabel: partner.discountLabel,
    }),
    bannerImageUrl: partner.bannerImageUrl,
    logoUrl: partner.logoUrl,
    logoOriginalUrl: partner.logoOriginalUrl,
    logoCrop: partner.logoCrop,
    location: partner.location,
    isFeatured: false,
  };
}

export function FavoritePartnerCard({ partner, onRemoved }: FavoritePartnerCardProps) {
  const brand = favoritePartnerToBrandCard(partner);

  return (
    <BrowseBrandCard
      brand={brand}
      canFavorite
      initialFavorited
      onFavoriteChange={(partnerId, favorited) => {
        if (!favorited) onRemoved(partnerId);
      }}
    />
  );
}

export function DiscoverMoreCard() {
  return (
    <Link
      href="/browse-brands"
      className="flex min-h-full flex-col items-center justify-center rounded-sm border-2 border-dashed border-border bg-primary/5 p-8 text-center transition-colors hover:border-primary"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl font-light text-primary">
        +
      </span>
      <h3 className="mt-4 text-sm font-bold text-foreground">Discover More Brands</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Explore new participating brands and unlock additional member savings across
        New Zealand.
      </p>
      <span className="mt-4 text-sm font-semibold text-primary">Browse Brands</span>
    </Link>
  );
}

export function FavoritesEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background px-6 py-16 text-center shadow-sm sm:px-10">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl text-primary">
        ♡
      </span>
      <h2 className="mt-6 text-2xl font-bold text-foreground">No saved brands yet</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Save your favourite brands to quickly find them again.
      </p>
      <Link
        href="/browse-brands"
        className="mt-8 fv-btn-primary inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
      >
        Browse Brands
      </Link>
    </div>
  );
}
