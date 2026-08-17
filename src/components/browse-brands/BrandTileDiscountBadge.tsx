type BrandTileDiscountBadgeProps = {
  discountPercent: number | null;
  discountLabel: string;
  className?: string;
  caption?: string | null;
  showMapIcon?: boolean;
  accent?: "primary" | "hospitality";
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
  caption,
  showMapIcon = false,
  accent = "primary",
}: BrandTileDiscountBadgeProps) {
  const percent = discountPercent ?? getBrandDiscountPercent({ discountPercent, discountLabel });
  const captionText = caption?.trim() || (percent != null ? "Storewide" : "");
  const badgeToneClass =
    accent === "hospitality"
      ? "bg-[#f472b6] text-white shadow-[0_4px_14px_rgba(244,114,182,0.35)]"
      : "bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(139,124,246,0.28)]";

  if (percent != null) {
    return (
      <div
        className={`absolute right-3 top-3 z-10 rounded-md px-3 py-2 text-center ${badgeToneClass} ${className}`.trim()}
      >
        <div className="text-[15px] font-extrabold leading-none tracking-tight">
          {percent}% OFF
        </div>
        {captionText ? (
          <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-[0.12em]">
            {showMapIcon ? <BadgeMapIcon /> : null}
            <span className="truncate">{captionText}</span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`absolute right-3 top-3 z-10 max-w-[8.5rem] rounded-md px-3 py-2 text-center ${badgeToneClass} ${className}`.trim()}
    >
      <div className="text-[11px] font-bold leading-tight">{discountLabel}</div>
      {caption?.trim() ? (
        <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-[0.12em]">
          {showMapIcon ? <BadgeMapIcon /> : null}
          <span className="truncate">{caption.trim()}</span>
        </div>
      ) : null}
    </div>
  );
}

function BadgeMapIcon() {
  return (
    <svg className="h-2.5 w-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}
