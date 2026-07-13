"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandOfferBadge } from "@/components/home/BrandOfferBadge";
import {
  brandCardContentClass,
  brandCardFavoriteButtonActiveClass,
  brandCardFavoriteButtonClass,
  brandCardLogoClass,
  brandCardOfferBadgeSlotClass,
  brandCardOfferFooterGroupClass,
  partnerBrandCardBodyClass,
  partnerBrandCardCtaClass,
  partnerBrandCardShellClass,
} from "@/components/browse-brands/brand-card-layout";
import { FavoriteHeartIcon } from "@/components/favorites/FavoriteHeartIcon";
import { PartnerBanner } from "@/components/partners/PartnerBanner";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { getAuthSession } from "@/lib/auth";
import { toggleFavoritePartnerAction } from "@/lib/member/favorites-actions";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";
import type { BrandCard } from "@/lib/member/browse-brands-types";

type BrowseBrandCardProps = {
  brand: BrandCard;
  canFavorite: boolean;
  initialFavorited: boolean;
  showFavorite?: boolean;
  ctaLabel?: string;
  onFavoriteChange?: (partnerId: string, favorited: boolean) => void;
};

export function BrowseBrandCard({
  brand,
  canFavorite,
  initialFavorited,
  showFavorite = true,
  ctaLabel = "View Brand",
  onFavoriteChange,
}: BrowseBrandCardProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const profilePath = partnerProfilePathFromSlug(brand.slug);
  const category = brand.departments[0] ?? brand.department ?? "New Zealand brand";

  function openProfile() {
    router.push(profilePath);
  }

  async function handleFavorite(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    if (!canFavorite) {
      const session = await getAuthSession();
      router.push(session ? "/pricing" : "/signup");
      return;
    }

    setLoading(true);
    const result = await toggleFavoritePartnerAction(brand.id, favorited);
    setLoading(false);

    if (!("error" in result) || !result.error) {
      const nextFavorited = !favorited;
      setFavorited(nextFavorited);
      onFavoriteChange?.(brand.id, nextFavorited);
      router.refresh();
    }
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProfile();
        }
      }}
      className={partnerBrandCardShellClass}
    >
      <div className="relative shrink-0 overflow-hidden">
        <PartnerBanner
          src={brand.bannerImageUrl}
          alt=""
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          imageClassName="transition-transform duration-200 ease-out group-hover:scale-[1.02]"
        />
      </div>

      <div className={partnerBrandCardBodyClass}>
        <PartnerLogo
          src={brand.logoUrl}
          originalSrc={brand.logoOriginalUrl}
          alt=""
          businessName={brand.businessName}
          size="sm"
          bordered
          shadow
          crop={brand.logoCrop}
          className={brandCardLogoClass}
        />
        <div className={brandCardContentClass}>
          <div className="mt-3 flex min-h-[2.5rem] items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-sm font-bold text-foreground">
                {brand.businessName}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{category}</p>
            </div>
            {showFavorite ? (
              <button
                type="button"
                onClick={handleFavorite}
                disabled={loading}
                aria-label={
                  favorited
                    ? `Remove ${brand.businessName} from favorites`
                    : `Save ${brand.businessName} to favorites`
                }
                aria-pressed={favorited}
                className={
                  favorited ? brandCardFavoriteButtonActiveClass : brandCardFavoriteButtonClass
                }
              >
                <FavoriteHeartIcon favorited={favorited} size="sm" />
              </button>
            ) : (
              <span aria-hidden className="h-9 w-9 shrink-0" />
            )}
          </div>

          <div className={brandCardOfferFooterGroupClass}>
            <div className={brandCardOfferBadgeSlotClass}>
              <BrandOfferBadge
                discountPercent={brand.discountPercent}
                discountLabel={brand.discountLabel}
              />
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openProfile();
              }}
              className={partnerBrandCardCtaClass}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
