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
      <section
        aria-label="Browse Brands"
        className="flex aspect-[1024/106] w-full items-center justify-center overflow-hidden bg-primary"
      >
        <div className="flex max-w-full flex-nowrap items-center justify-center gap-[clamp(0.5rem,2.5vw,1.5rem)] px-[clamp(0.75rem,3vw,1.5rem)]">
          <h1 className="shrink-0 whitespace-nowrap text-[clamp(1.125rem,4.5vw,2.25rem)] font-bold leading-none tracking-tight text-white">
            Browse Brands
          </h1>
          <Image
            src="/browse-brands/hero-kiwi.png"
            alt=""
            width={1024}
            height={106}
            priority
            className="h-[clamp(2.75rem,10vw,6.625rem)] w-auto shrink-0 object-contain mix-blend-screen"
            sizes="(max-width: 768px) 50vw, 512px"
            draggable={false}
          />
        </div>
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
