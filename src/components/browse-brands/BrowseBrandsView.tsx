"use client";

import Image from "next/image";
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
      <section className="w-full leading-none">
        <Image
          src="/browse-brands/hero-banner.png"
          alt="Browse Brands — Discover participating brands"
          width={1600}
          height={280}
          priority
          className="block h-auto w-full"
          sizes="100vw"
        />
      </section>

      <div className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-8">
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

      <PartnerJoinCTA className="bg-surface-lavender pb-5 pt-3 sm:pb-7 sm:pt-4 lg:pt-5" />
    </div>
  );
}
