import Link from "next/link";
import { PartnerBanner } from "@/components/partners/PartnerBanner";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { getBrandDiscountPercent } from "@/components/browse-brands/BrandTileDiscountBadge";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";
import type { BrandCard } from "@/lib/member/browse-brands-types";

type HowItWorksHeroCollageProps = {
  brands: BrandCard[];
};

const cardPositions = [
  "left-[2%] top-[4%] -rotate-6",
  "right-[4%] top-[0%] rotate-3",
  "left-[8%] bottom-[8%] rotate-2",
  "right-[2%] bottom-[4%] -rotate-3",
  "left-[32%] top-[28%] rotate-1",
] as const;

function HeroBrandCard({
  brand,
  className,
  priority,
}: {
  brand: BrandCard;
  className?: string;
  priority?: boolean;
}) {
  const percent = getBrandDiscountPercent({
    discountPercent: brand.discountPercent,
    discountLabel: brand.discountLabel,
  });

  return (
    <Link
      href={partnerProfilePathFromSlug(brand.slug)}
      className={`absolute w-[42%] max-w-[148px] overflow-hidden rounded-xl border border-border bg-background shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${className ?? ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <PartnerBanner
          src={brand.bannerImageUrl}
          alt=""
          sizes="148px"
          priority={priority}
          className="absolute inset-0 aspect-auto h-full w-full"
          imageClassName="object-cover"
        />
        {percent != null ? (
          <span className="absolute right-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            {percent}% OFF
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2 px-2.5 py-2">
        <PartnerLogo
          src={brand.logoUrl}
          originalSrc={brand.logoOriginalUrl}
          alt=""
          businessName={brand.businessName}
          size="xs"
          crop={brand.logoCrop}
          className="h-6 w-6 shrink-0"
        />
        <span className="line-clamp-1 text-[11px] font-semibold text-foreground">
          {brand.businessName}
        </span>
      </div>
    </Link>
  );
}

export function HowItWorksHeroCollage({ brands }: HowItWorksHeroCollageProps) {
  const displayBrands = brands.slice(0, 5);

  if (displayBrands.length === 0) {
    return (
      <div className="relative mx-auto hidden aspect-square w-full max-w-[320px] lg:block">
        <div className="absolute inset-[18%] rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-card" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-[320px] lg:block">
      <div className="absolute inset-[18%] rounded-lg bg-gradient-to-br from-primary/15 to-primary/5" />
      {displayBrands.map((brand, index) => (
        <HeroBrandCard
          key={brand.id}
          brand={brand}
          className={cardPositions[index] ?? cardPositions[0]}
          priority={index < 2}
        />
      ))}
    </div>
  );
}
