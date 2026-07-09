"use client";

import { BrowseBrandsExplorer } from "@/components/browse-brands/BrowseBrandsExplorer";
import { PartnerJoinCTA } from "@/components/partners/PartnerJoinCTA";
import type { BrandCard } from "@/lib/member/browse-brands-types";

type BrowseBrandsViewProps = {
  featured: BrandCard[];
  initialExplore: BrandCard[];
  initialTotal: number;
  canFavorite: boolean;
  favoritedPartnerIds: string[];
  initialDepartment?: string;
  initialSubcategory?: string;
};

export function BrowseBrandsView({
  featured,
  initialExplore,
  initialTotal,
  canFavorite,
  favoritedPartnerIds,
  initialDepartment = "",
  initialSubcategory = "",
}: BrowseBrandsViewProps) {
  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <section className="bg-gradient-to-b from-surface-lavender via-background to-background">
        <div className="mx-auto max-w-3xl px-4 py-7 text-center sm:px-6 sm:py-10 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Discover Participating Brands
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Browse Brands
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Discover food, beverage, household and health brands offering
            exclusive member pricing through FoodVault. Use the filters below to
            quickly find the brands that match what you&apos;re looking for.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
        <BrowseBrandsExplorer
          featured={featured}
          initialExplore={initialExplore}
          initialTotal={initialTotal}
          canFavorite={canFavorite}
          favoritedPartnerIds={favoritedPartnerIds}
          initialDepartment={initialDepartment}
          initialSubcategory={initialSubcategory}
        />
      </div>

      <PartnerJoinCTA className="bg-surface-lavender pb-10 pt-6 sm:pb-14 sm:pt-8 lg:pt-10" />
    </div>
  );
}
