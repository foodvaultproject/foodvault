"use client";

import Link from "next/link";
import { HOME_MARQUEE_PY } from "@/components/home/section-spacing";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import type { PartnerLogoItem } from "@/lib/member/browse-brands";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";

type BrandLogoCarouselProps = {
  logos: PartnerLogoItem[];
};

export function BrandLogoCarousel({ logos }: BrandLogoCarouselProps) {
  if (logos.length === 0) return null;

  // Duplicate the list so the marquee can loop seamlessly (-50% translate).
  const items = [...logos, ...logos];

  return (
    <div className={`foodvault-marquee relative overflow-hidden bg-background ${HOME_MARQUEE_PY}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <div className="foodvault-marquee-track flex items-center gap-12">
        {items.map((logo, index) => {
          const image = logo.logoUrl ?? logo.bannerImageUrl;
          const usingLogo = Boolean(logo.logoUrl);
          return (
            <Link
              key={`${logo.id}-${index}`}
              href={partnerProfilePathFromSlug(logo.slug)}
              aria-label={logo.businessName}
              className="group flex shrink-0 items-center justify-center"
            >
              {image ? (
                <PartnerLogo
                  src={image}
                  originalSrc={usingLogo ? logo.logoOriginalUrl : null}
                  alt={logo.businessName}
                  businessName={logo.businessName}
                  size="carousel"
                  crop={usingLogo ? logo.logoCrop : null}
                />
              ) : (
                <span className="flex h-[5.2rem] w-[5.2rem] items-center justify-center text-base font-bold text-muted-foreground">
                  {logo.businessName}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
