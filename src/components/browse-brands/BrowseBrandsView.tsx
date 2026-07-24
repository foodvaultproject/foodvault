"use client";

import { BrowseBrandsExplorer } from "@/components/browse-brands/BrowseBrandsExplorer";
import { OwnAKiwiBrandCard } from "@/components/partners/OwnAKiwiBrandCard";
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
      <h1 className="sr-only">Browse Brands</h1>

      <div className="mx-auto max-w-[1200px] overflow-visible px-4 py-8 sm:px-6 lg:px-8">
        <BrowseBrandsExplorer
          featured={featured}
          initialExplore={initialExplore}
          initialTotal={initialTotal}
          canFavorite={canFavorite}
          favoritedPartnerIds={favoritedPartnerIds}
          initialDepartment={initialDepartment}
          initialSubcategory={initialSubcategory}
          exploreHeading=""
          compactSpacing
        />
      </div>

      <section className="bg-surface-lavender pb-5 pt-3 sm:pb-7 sm:pt-4 lg:pt-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <OwnAKiwiBrandCard />
        </div>
      </section>
    </div>
  );
}
