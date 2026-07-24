type BrandTileDiscountBadgeProps = {
  discountPercent: number | null;
  discountLabel: string;
  className?: string;
};

export function getBrandDiscountPercent(brand: {
  discountPercent: number | null;
  discountLabel: string;
}): number | null {
  if (brand.discountPercent != null && Number.isFinite(brand.discountPercent)) {
    return Math.round(brand.discountPercent);
  }

  const match = brand.discountLabel.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Math.round(Number(match[1])) : null;
}

export function BrandTileDiscountBadge({
  discountPercent,
  discountLabel,
  className = "",
}: BrandTileDiscountBadgeProps) {
  const percent = discountPercent ?? getBrandDiscountPercent({ discountPercent, discountLabel });

  if (percent != null) {
    return (
      <div
        className={`absolute right-3 top-3 z-10 rounded-md bg-primary px-3 py-2 text-center text-primary-foreground shadow-[0_4px_14px_rgba(139,124,246,0.28)] ${className}`.trim()}
      >
        <div className="text-[15px] font-extrabold leading-none tracking-tight">
          {percent}% OFF
        </div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em]">
          Storewide
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute right-3 top-3 z-10 max-w-[8.5rem] rounded-md bg-primary px-3 py-2 text-center text-[11px] font-bold leading-tight text-primary-foreground shadow-[0_4px_14px_rgba(139,124,246,0.28)] ${className}`.trim()}
    >
      {discountLabel}
    </div>
  );
}
