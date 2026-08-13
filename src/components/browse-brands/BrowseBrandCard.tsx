"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandTileDiscountBadge } from "@/components/browse-brands/BrandTileDiscountBadge";
import {
  brandCardContentClass,
  brandCardLogoClass,
  partnerBrandCardBodyClass,
  partnerBrandCardShellClass,
} from "@/components/browse-brands/brand-card-layout";
import { FavoriteHeartIcon } from "@/components/favorites/FavoriteHeartIcon";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { getAuthSession } from "@/lib/auth";
import { toggleFavoritePartnerAction } from "@/lib/member/favorites-actions";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";
import type { BrandCard } from "@/lib/member/browse-brands-types";

const cardGallerySizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

const favoriteOnImageClass =
  "absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/30 disabled:opacity-60";

const favoriteOnImageActiveClass =
  "absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-105 disabled:opacity-60";

type BrowseBrandCardProps = {
  brand: BrandCard;
  canFavorite: boolean;
  initialFavorited: boolean;
  showFavorite?: boolean;
  onFavoriteChange?: (partnerId: string, favorited: boolean) => void;
};

export function BrowseBrandCard({
  brand,
  canFavorite,
  initialFavorited,
  showFavorite = true,
  onFavoriteChange,
}: BrowseBrandCardProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const profilePath = partnerProfilePathFromSlug(brand.slug);
  const category = brand.departments[0] ?? brand.department ?? "New Zealand brand";
  const imageSrc = brand.galleryImageUrl ?? brand.bannerImageUrl;

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
    <Link
      href={profilePath}
      prefetch
      aria-label={`${brand.businessName} — view member offer`}
      className={`${partnerBrandCardShellClass} hover:border-primary/25`}
    >
      <div className="relative shrink-0 overflow-hidden">
        {imageSrc ? (
          <PartnerGalleryImage
            src={imageSrc}
            alt=""
            sizes={cardGallerySizes}
            className="!rounded-none"
            imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-primary/30 to-primary/5" />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

        <BrandTileDiscountBadge
          discountPercent={brand.discountPercent}
          discountLabel={brand.discountLabel}
          className="bottom-3 right-3 left-auto top-auto max-w-[calc(100%-3.5rem)]"
        />

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
            className={favorited ? favoriteOnImageActiveClass : favoriteOnImageClass}
          >
            <FavoriteHeartIcon favorited={favorited} size="sm" />
          </button>
        ) : null}
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
        <div className={`${brandCardContentClass} pb-1`}>
          <h3 className="line-clamp-1 text-sm font-bold text-foreground">
            {brand.businessName}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{category}</p>
          <p className="mt-2 text-xs font-semibold text-primary/75 transition-colors group-hover:text-primary">
            See offer →
          </p>
        </div>
      </div>
    </Link>
  );
}
