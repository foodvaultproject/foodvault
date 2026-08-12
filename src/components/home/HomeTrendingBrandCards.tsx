import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  BrandTileDiscountBadge,
  getBrandDiscountPercent,
} from "@/components/browse-brands/BrandTileDiscountBadge";
import { PartnerBanner } from "@/components/partners/PartnerBanner";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";
import type { BrandCard } from "@/lib/member/browse-brands-types";

function brandCategory(brand: BrandCard) {
  return brand.departments[0] ?? brand.department ?? "Brand";
}

function formatDiscountValue(brand: BrandCard) {
  const percent = getBrandDiscountPercent(brand);
  if (percent != null) {
    return `${percent}% OFF`;
  }
  return brand.discountLabel || "Member Offer";
}

/** Banner-only homepage cards — no body/footer area below the image. */
const bannerCardClass =
  "group block overflow-hidden rounded-lg border border-border shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const cardBannerSizes = "(max-width: 640px) 100vw, 50vw";
const newBrandGallerySizes = "(max-width: 1024px) 50vw, 25vw";

const bannerTextOverlayClass =
  "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/36 to-transparent px-3 pb-3 pt-12 sm:px-4 sm:pb-4";

function SlantedPrimaryBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block -skew-x-12 bg-primary px-2.5 py-1 shadow-sm sm:px-3 sm:py-1.5 ${className}`.trim()}
    >
      <span className="inline-block skew-x-12 text-xs font-bold leading-none text-primary-foreground sm:text-sm">
        {children}
      </span>
    </span>
  );
}

function TrendingGrowthArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-primary ${className}`.trim()}
    >
      <path
        d="M10 56L28 38L42 48L68 18"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 18H68V34"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 66H68"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export function TrendingThisWeekCard({ brand }: { brand: BrandCard }) {
  const category = brandCategory(brand);

  return (
    <Link href={partnerProfilePathFromSlug(brand.slug)} className={bannerCardClass}>
      <div className="relative">
        <PartnerBanner
          src={brand.bannerImageUrl}
          alt=""
          sizes={cardBannerSizes}
          imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute bottom-1 right-1 z-10 sm:bottom-2 sm:right-2">
          <TrendingGrowthArrow className="h-[4.5rem] w-[4.5rem] sm:h-24 sm:w-24" />
        </div>
        <div className={`${bannerTextOverlayClass} pr-[4.25rem] sm:pr-24`}>
          <p className="truncate text-sm font-bold text-white sm:text-base">
            {brand.businessName}
          </p>
          <p className="mt-0.5 truncate text-xs text-white/85">{category}</p>
          <p className="mt-1.5">
            <SlantedPrimaryBadge>{formatDiscountValue(brand)}</SlantedPrimaryBadge>
          </p>
        </div>
      </div>
    </Link>
  );
}

const newBrandLogoClass =
  "relative aspect-square h-16 w-16 min-h-16 min-w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_4px_16px_rgba(15,23,42,0.18)] sm:h-[4.5rem] sm:w-[4.5rem] sm:min-h-[4.5rem] sm:min-w-[4.5rem]";

function NewBrandCircularLogo({
  src,
  businessName,
}: {
  src: string | null;
  businessName: string;
}) {
  const initial = businessName.trim().charAt(0).toUpperCase() || "?";

  if (!src) {
    return (
      <div
        className={`${newBrandLogoClass} flex items-center justify-center bg-primary/15`}
        aria-hidden="true"
      >
        <span className="text-xl font-bold text-primary sm:text-2xl">{initial}</span>
      </div>
    );
  }

  return (
    <div className={newBrandLogoClass}>
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 64px, 72px"
        className="object-contain object-center p-1"
        unoptimized
      />
    </div>
  );
}

export function NewBrandCard({ brand }: { brand: BrandCard }) {
  const imageSrc = brand.galleryImageUrl ?? brand.bannerImageUrl;

  return (
    <Link
      href={partnerProfilePathFromSlug(brand.slug)}
      className={bannerCardClass}
      aria-label={brand.businessName}
    >
      <div className="relative">
        {imageSrc ? (
          <PartnerGalleryImage
            src={imageSrc}
            alt=""
            sizes={newBrandGallerySizes}
            className="!rounded-none"
            imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-primary/30 to-primary/5" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
        <div className="absolute bottom-2 left-2 z-10 flex max-w-[calc(100%-1rem)] items-end gap-2 sm:bottom-3 sm:left-3 sm:gap-2.5">
          <NewBrandCircularLogo src={brand.logoUrl} businessName={brand.businessName} />
          <p className="min-w-0 flex-1 truncate pb-0.5 text-sm font-bold text-white drop-shadow-sm sm:pb-1 sm:text-base">
            {brand.businessName}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function TopMemberOfferCard({ brand }: { brand: BrandCard }) {
  const category = brandCategory(brand);

  return (
    <Link href={partnerProfilePathFromSlug(brand.slug)} className={bannerCardClass}>
      <div className="relative">
        <PartnerBanner
          src={brand.bannerImageUrl}
          alt=""
          sizes={cardBannerSizes}
          imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <BrandTileDiscountBadge
          discountPercent={brand.discountPercent}
          discountLabel={brand.discountLabel}
        />
        <div className={bannerTextOverlayClass}>
          <p className="truncate text-sm font-bold text-white sm:text-base">
            {brand.businessName}
          </p>
          <p className="mt-0.5 truncate text-xs text-white/85">{category}</p>
        </div>
      </div>
    </Link>
  );
}
