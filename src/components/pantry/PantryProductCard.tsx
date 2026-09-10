"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/media/SafeImage";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import {
  formatUnitPrice,
  pantryProductPath,
  productDiscountPercent,
} from "@/lib/commerce/catalog";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultProduct } from "@/types/commerce";

export function PantryProductCard({ product }: { product: FoodVaultProduct }) {
  const { addToCart, toggleGrocery, isSaved, addedIds } = usePantryMarket();
  const saved = isSaved(product.id);
  const savePercent = productDiscountPercent(product);
  const unitPrice = formatUnitPrice(product);
  const outOfStock = product.stock_quantity <= 0;
  const added = Boolean(addedIds[product.id]);
  const href = pantryProductPath(product);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-vm-primary/30 bg-background">
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Link href={href} className="absolute inset-0">
          <SafeImage
            src={product.image_url ?? ""}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 50vw, 20vw"
            className="object-cover"
            fallbackVariant="muted"
          />
        </Link>
        {savePercent > 0 ? (
          <span className="absolute left-2 top-2 z-10 rounded-sm border border-vm-secondary/30 bg-vm-secondary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-vm-secondary">
            {savePercent}% off
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => toggleGrocery(product)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from grocery list` : `Save ${product.name} to grocery list`}
          className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/95 text-vm-primary shadow-sm transition-colors hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-vm-primary" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-vm-primary">
          {product.brand}
        </p>
        <Link href={href} className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-foreground hover:text-vm-primary">
          {product.name}
        </Link>
        {unitPrice ? (
          <p className="mt-1 text-[11px] text-muted">{unitPrice}</p>
        ) : null}

        <div className="mt-2">
          <span className="inline-flex items-center rounded-sm border border-vm-secondary/30 bg-vm-secondary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-vm-secondary">
            Member
          </span>
          <p className="mt-1 text-base font-bold leading-none text-vm-primary">
            {formatNzPrice(product.member_price)}
          </p>
          <p className="mt-1 text-xs text-muted-light line-through">
            {formatNzPrice(product.retail_price)}
          </p>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => addToCart(product)}
          className="mt-auto inline-flex h-9 w-full items-center justify-center rounded-sm bg-vm-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-vm-surface disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {outOfStock ? "Out of stock" : added ? "Added" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
