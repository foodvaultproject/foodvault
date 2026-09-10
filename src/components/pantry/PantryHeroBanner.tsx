"use client";

import Link from "next/link";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import { productDiscountPercent } from "@/lib/commerce/catalog";

export function PantryHeroBanner() {
  const { products } = usePantryMarket();
  const maxSave = products.reduce(
    (highest, product) => Math.max(highest, productDiscountPercent(product)),
    0
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#10B981]/30 bg-[#064E3B] px-5 py-6 text-white sm:px-8 sm:py-8">
      <div className="relative z-10 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
          Vault Market
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Member deals on imported pantry staples
        </h2>
        <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
          {maxSave > 0
            ? `Save up to ${maxSave}% off retail on new arrivals and weekly member specials.`
            : "Shop new arrivals and weekly member specials at FoodVault prices."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/pantry?department=pantry"
            className="inline-flex h-10 items-center rounded-sm bg-[#10B981] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#064E3B]"
          >
            Shop pantry deals
          </Link>
          <Link
            href="/pantry?department=drinks"
            className="inline-flex h-10 items-center rounded-sm border border-[#10B981]/30 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Browse drinks
          </Link>
        </div>
      </div>
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 sm:h-56 sm:w-56"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-white/10"
        aria-hidden="true"
      />
    </div>
  );
}
