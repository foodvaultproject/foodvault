"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { BrandTileDiscountBadge } from "@/components/browse-brands/BrandTileDiscountBadge";
import {
  brandCardContentClass,
  brandCardLogoClass,
  partnerBrandCardBodyClass,
  partnerBrandCardShellClass,
  hospitalityBrandCardShellClass,
} from "@/components/browse-brands/brand-card-layout";
import { FavoriteHeartIcon } from "@/components/favorites/FavoriteHeartIcon";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { getAuthSession } from "@/lib/auth";
import {
  isLocalHospitalityFavorited,
  shouldUseLocalHospitalityFavorite,
  toggleLocalHospitalityFavorite,
} from "@/lib/hospitality/local-favorites";
import { HOSPITALITY_CARD_ACCENT } from "@/lib/hospitality/constants";
import { isHospitalityListing } from "@/lib/hospitality/types";
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
  const [favorited, setFavorited] = useState(() =>
    shouldUseLocalHospitalityFavorite(brand.id)
      ? isLocalHospitalityFavorited(brand.id)
      : initialFavorited
  );
  useEffect(() => {
    setFavorited(
      shouldUseLocalHospitalityFavorite(brand.id)
        ? isLocalHospitalityFavorited(brand.id)
        : initialFavorited
    );
  }, [brand.id, initialFavorited]);
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
    favorited,
    (_current, nextValue: boolean) => nextValue
  );
  const [isPending, startTransition] = useTransition();
  const profilePath = partnerProfilePathFromSlug(brand.slug);
  const isLocalVenue = isHospitalityListing(brand.listingModel);
  const category = isLocalVenue
    ? brand.locationLabel || brand.location || brand.departments[0] || brand.department || "Local venue"
    : brand.departments[0] ?? brand.department ?? "New Zealand brand";
  const imageSrc = brand.galleryImageUrl ?? brand.bannerImageUrl;

  function handleFavorite(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) return;

    if (!canFavorite) {
      void getAuthSession().then((session) => {
        if (!session) {
          router.push("/signup");
          return;
        }
        if (session.accountType !== "member") {
          return;
        }
        toggleFavorite();
      });
      return;
    }

    toggleFavorite();
  }

  function toggleFavorite() {
    startTransition(async () => {
      const nextFavorited = !optimisticFavorited;
      setOptimisticFavorited(nextFavorited);

      if (shouldUseLocalHospitalityFavorite(brand.id)) {
        toggleLocalHospitalityFavorite(brand.id);
        setFavorited(nextFavorited);
        onFavoriteChange?.(brand.id, nextFavorited);
        return;
      }

      const result = await toggleFavoritePartnerAction(brand.id, optimisticFavorited);
      if ("error" in result && result.error) {
        return;
      }

      setFavorited(nextFavorited);
      onFavoriteChange?.(brand.id, nextFavorited);
    });
  }

  const shellClass = isLocalVenue
    ? hospitalityBrandCardShellClass
    : `${partnerBrandCardShellClass} hover:border-primary/25`;

  return (
    <Link
      href={profilePath}
      prefetch
      aria-label={`${brand.businessName} — view member offer`}
      className={shellClass}
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

        {isLocalVenue ? (
          <span
            className="absolute left-2 top-2 z-20 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground shadow-sm"
            style={{ backgroundColor: HOSPITALITY_CARD_ACCENT }}
          >
            Instore Only
          </span>
        ) : null}

        <BrandTileDiscountBadge
          discountPercent={brand.discountPercent}
          discountLabel={brand.discountLabel}
          caption={isLocalVenue ? brand.locationLabel || brand.location : undefined}
          showMapIcon={isLocalVenue}
          accent={isLocalVenue ? "hospitality" : "primary"}
          className="bottom-3 right-3 left-auto top-auto max-w-[calc(100%-3.5rem)]"
        />

        {showFavorite ? (
          <button
            type="button"
            onClick={handleFavorite}
            disabled={isPending}
            aria-label={
              optimisticFavorited
                ? `Remove ${brand.businessName} from favorites`
                : `Save ${brand.businessName} to favorites`
            }
            aria-pressed={optimisticFavorited}
            className={optimisticFavorited ? favoriteOnImageActiveClass : favoriteOnImageClass}
          >
            <FavoriteHeartIcon favorited={optimisticFavorited} size="sm" />
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
        <div className={brandCardContentClass}>
          <p className="truncate text-sm font-semibold text-foreground">{brand.businessName}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            {isLocalVenue ? (
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            ) : null}
            <span className="truncate">{category}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
