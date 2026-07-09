import { getBrandDiscountPercent } from "@/components/browse-brands/BrandTileDiscountBadge";

type BrandOfferBadgeProps = {
  discountPercent: number | null;
  discountLabel: string;
  className?: string;
};

export function BrandOfferBadge({
  discountPercent,
  discountLabel,
  className = "",
}: BrandOfferBadgeProps) {
  const percent = getBrandDiscountPercent({ discountPercent, discountLabel });

  if (percent == null) {
    return (
      <span
        className={`inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ${className}`.trim()}
      >
        Exclusive Member Offer
      </span>
    );
  }

  if (percent >= 25) {
    return (
      <span
        className={`inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-700 ${className}`.trim()}
      >
        {percent}% OFF
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full bg-success-light px-2.5 py-1 text-[11px] font-semibold text-success ${className}`.trim()}
    >
      {percent}% OFF
    </span>
  );
}
