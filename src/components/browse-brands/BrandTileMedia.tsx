import { BrandTileDiscountBadge } from "@/components/browse-brands/BrandTileDiscountBadge";
import { PartnerBanner } from "@/components/partners/PartnerBanner";

type BrandTileMediaProps = {
  bannerImageUrl: string | null;
  discountPercent: number | null;
  discountLabel: string;
};

export function BrandTileMedia({
  bannerImageUrl,
  discountPercent,
  discountLabel,
}: BrandTileMediaProps) {
  return (
    <div className="relative shrink-0 overflow-hidden">
      <PartnerBanner
        src={bannerImageUrl}
        alt=""
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      />
      <BrandTileDiscountBadge
        discountPercent={discountPercent}
        discountLabel={discountLabel}
      />
    </div>
  );
}
