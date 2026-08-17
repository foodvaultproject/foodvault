"use client";

import { Suspense, useEffect, useState } from "react";
import { BrowseBrandsExplorer } from "@/components/browse-brands/BrowseBrandsExplorer";
import { useIsActiveMember } from "@/components/member/MemberSignupCtaProvider";
import { OwnAKiwiBrandCard } from "@/components/partners/OwnAKiwiBrandCard";
import { getAuthSession } from "@/lib/auth";
import { readAuthStateHintClient } from "@/lib/auth/session-hint";
import type { BrandCard } from "@/lib/member/browse-brands-types";

type BrowseBrandsViewProps = {
  featured: BrandCard[];
  initialExplore: BrandCard[];
  initialTotal: number;
  initialLocalExplore?: BrandCard[];
  initialLocalTotal?: number;
  canFavorite: boolean;
  favoritedPartnerIds: string[];
  initialDepartment?: string;
  initialSubcategory?: string;
};

function BrowseBrandsExplorerFallback() {
  return (
    <div className="mt-5 sm:mt-7">
      <div className="h-40 animate-pulse rounded-lg border border-border bg-background" />
      <div className="mt-6 grid grid-cols-2 gap-[5px] lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[3/4] animate-pulse rounded-lg bg-border/70"
          />
        ))}
      </div>
    </div>
  );
}

export function BrowseBrandsView(props: BrowseBrandsViewProps) {
  const {
    featured,
    initialExplore,
    initialTotal,
    initialLocalExplore = [],
    initialLocalTotal = 0,
    canFavorite,
    favoritedPartnerIds,
    initialDepartment = "",
    initialSubcategory = "",
  } = props;
  const isActiveMember = useIsActiveMember();
  const [isPartner, setIsPartner] = useState(
    () => readAuthStateHintClient() === "partner"
  );

  useEffect(() => {
    let cancelled = false;
    void getAuthSession().then((session) => {
      if (!cancelled) setIsPartner(session?.accountType === "partner");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <h1 className="sr-only">Browse Brands</h1>

      <div className="mx-auto max-w-[1200px] overflow-visible px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<BrowseBrandsExplorerFallback />}>
          <BrowseBrandsExplorer
            featured={featured}
            initialExplore={initialExplore}
            initialTotal={initialTotal}
            initialLocalExplore={initialLocalExplore}
            initialLocalTotal={initialLocalTotal}
            canFavorite={canFavorite}
            favoritedPartnerIds={favoritedPartnerIds}
            initialDepartment={initialDepartment}
            initialSubcategory={initialSubcategory}
            exploreHeading=""
            compactSpacing
          />
        </Suspense>
      </div>

      {isActiveMember || isPartner ? null : (
        <section className="bg-surface-lavender pb-5 pt-3 sm:pb-7 sm:pt-4 lg:pt-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <OwnAKiwiBrandCard />
          </div>
        </section>
      )}
    </div>
  );
}
