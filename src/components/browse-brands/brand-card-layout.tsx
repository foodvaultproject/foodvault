import type { ReactNode } from "react";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import type { LogoCropSettings } from "@/lib/partner-logo-crop";

type BrandTileBodyProps = {
  logoUrl: string | null;
  logoOriginalUrl?: string | null;
  logoCrop: LogoCropSettings | null;
  businessName: string;
  children: ReactNode;
};

/** Shared layout classes for partner/brand listing cards. */
export const brandTileSectionClass = "mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8";

/** Homepage grid — 2 tiles across on mobile, 4 across at lg, matching Top Brands section. */
export const brandTileGridClass =
  "grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4";

/** @deprecated Use brandTileGridClass */
export const brandTileGridClassWide = brandTileGridClass;

/** Homepage-style partner tile shell (Top Brands section). */
export const partnerBrandCardShellClass =
  "group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-background shadow-card transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export const brandCardShellClass = partnerBrandCardShellClass;

/** Compact tile body — logo overlaps banner; matches homepage Top Brands cards. */
export const partnerBrandCardBodyClass = "relative flex flex-1 flex-col px-4 pb-4";

export const brandCardBodyClass = partnerBrandCardBodyClass;

/** Clears the lower half of the 64px logo before text content begins. */
export const brandCardContentClass = "flex min-h-0 flex-1 flex-col pt-8";

/** sm PartnerLogo is h-16 (4rem); -top-8 places it half on the banner, half on the body. */
export const partnerBrandCardLogoClass =
  "!absolute -top-8 left-4 z-10 ring-4 ring-background";

export const brandCardLogoClass = partnerBrandCardLogoClass;

export const brandCardCategorySlotClass = "mt-2 min-h-[3.25rem]";

export const brandCardDescriptionClass =
  "mt-2.5 min-h-[2.75rem] flex-1 line-clamp-2 text-sm leading-snug text-muted-foreground";

/** Badge + CTA grouped at the card foot with a tight 8px gap. */
export const brandCardOfferFooterGroupClass =
  "mt-auto flex w-full shrink-0 flex-col gap-2";

/** Fixed-height slot so offer badges align consistently across cards. */
export const brandCardOfferBadgeSlotClass = "flex min-h-[1.75rem] items-start";

/** @deprecated Use brandCardOfferFooterGroupClass on the badge+CTA wrapper. */
export const brandCardFooterClass = brandCardOfferFooterGroupClass;

export const partnerBrandCardCtaClass =
  "fv-btn-primary flex h-10 w-full items-center justify-center rounded-sm border-0 p-0 text-sm font-medium leading-none text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5";

export const brandCardCtaClass = partnerBrandCardCtaClass;

export const brandCardFavoriteButtonClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background transition-colors hover:border-primary/30 disabled:opacity-60";

export const brandCardFavoriteButtonActiveClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 transition-transform hover:scale-105 disabled:opacity-60";

export function BrandTileBody({
  logoUrl,
  logoOriginalUrl = null,
  logoCrop,
  businessName,
  children,
}: BrandTileBodyProps) {
  return (
    <div className={brandCardBodyClass}>
      <PartnerLogo
        src={logoUrl}
        originalSrc={logoOriginalUrl}
        alt=""
        businessName={businessName}
        size="sm"
        bordered
        shadow
        crop={logoCrop}
        className={brandCardLogoClass}
      />
      <div className={brandCardContentClass}>{children}</div>
    </div>
  );
}
