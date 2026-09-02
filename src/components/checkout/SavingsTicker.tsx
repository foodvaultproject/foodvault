"use client";

import { SafeImage } from "@/components/media/SafeImage";
import type { SavingsTickerImage } from "@/lib/homepage/hero-gallery-images";

const SAVINGS_AMOUNTS = [15, 22.5, 8.5, 35, 12] as const;

const BADGE_POSITIONS = [
  "right-1.5 top-1.5",
  "bottom-1.5 left-1.5",
  "right-1.5 bottom-1.5",
  "left-1.5 top-1.5",
  "right-2 top-2",
] as const;

type SavingsTickerProps = {
  images: SavingsTickerImage[];
};

function formatSavingsBadge(amount: number) {
  return `+$${amount.toFixed(2)}`;
}

function buildMarqueeItems(images: SavingsTickerImage[]) {
  if (images.length === 0) return [];

  const base = [...images];
  while (base.length < 8) {
    base.push(...images);
  }

  return [...base, ...base];
}

export function SavingsTicker({ images }: SavingsTickerProps) {
  const items = buildMarqueeItems(images);

  if (items.length === 0) return null;

  return (
    <section className="mt-8" aria-label="Partner product savings">
      <div className="flex justify-center">
        <p className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Real Kiwi Brands • Immediate Savings
        </p>
      </div>

      <div className="foodvault-marquee relative mt-4 overflow-hidden rounded-xl border border-border bg-navy/95 py-4 shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-navy to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-navy to-transparent sm:w-16" />

        <div className="foodvault-savings-ticker-track flex items-center gap-3 px-3 sm:gap-4">
          {items.map((image, index) => {
            const amount = SAVINGS_AMOUNTS[index % SAVINGS_AMOUNTS.length];
            const badgePosition = BADGE_POSITIONS[index % BADGE_POSITIONS.length];
            const delayMs = (index % 8) * 180;

            return (
              <div
                key={`${image.src}-${index}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10 shadow-md sm:h-28 sm:w-28"
              >
                <SafeImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="112px"
                  className="object-cover"
                  fallbackVariant="muted"
                />
                <span
                  className={`fv-savings-badge absolute z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold tracking-tight text-white shadow-md sm:text-xs ${badgePosition}`}
                  style={{ animationDelay: `${delayMs}ms` }}
                >
                  {formatSavingsBadge(amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-2.5 text-center text-xs italic text-muted-foreground">
        *Hypothetical savings calculated at standard 15% partner discount tiers.
      </p>
    </section>
  );
}
