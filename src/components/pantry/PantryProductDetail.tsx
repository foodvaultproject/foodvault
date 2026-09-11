"use client";

import { ChevronDown, Heart, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { LostSaleTracker } from "@/components/pantry/LostSaleTracker";
import { PantryProductGallery } from "@/components/pantry/PantryProductGallery";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import { MultibuyBadge } from "@/components/pantry/MultibuyBadge";
import {
  formatMultibuyBadge,
  formatUnitPrice,
  isMultibuyDeal,
  multibuyBundleSavings,
  pantryDepartmentPath,
  productDiscountPercent,
  productGallery,
  resolveProductDepartment,
  resolveProductSubcategory,
} from "@/lib/commerce/catalog";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultProduct } from "@/types/commerce";

function HealthStarBadge({ rating }: { rating: number }) {
  const display = Number.isInteger(rating) ? String(rating) : rating.toFixed(1);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1"
      title={`${display} Health Star Rating`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vm-primary text-xs font-bold text-white">
        {display}
      </span>
      <span className="text-[11px] font-semibold leading-tight text-foreground">
        Health Star
        <br />
        Rating
      </span>
    </div>
  );
}

function AccordionBlock({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="text-sm font-bold text-foreground">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{children}</div> : null}
    </div>
  );
}

export function PantryProductDetail({ product }: { product: FoodVaultProduct }) {
  const { addToCart, toggleGrocery, isSaved, addedIds } = usePantryMarket();
  const gallery = productGallery(product);
  const [quantity, setQuantity] = useState(1);
  const saved = isSaved(product.id);
  const added = Boolean(addedIds[product.id]);
  const department = resolveProductDepartment(product);
  const subcategory = resolveProductSubcategory(product);
  const savePercent = productDiscountPercent(product);
  const unitPrice = formatUnitPrice(product);
  const outOfStock = product.stock_quantity <= 0;
  const multibuy = isMultibuyDeal(product);
  const multibuyLabel = formatMultibuyBadge(product);
  const multibuySavings = multibuyBundleSavings(product);

  const crumbs = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/pantry", label: "Pantry" },
      { href: pantryDepartmentPath(department), label: department },
      { href: pantryDepartmentPath(department, subcategory), label: subcategory },
    ],
    [department, subcategory]
  );

  return (
    <div>
      {outOfStock ? (
        <LostSaleTracker
          events={[
            {
              product_id: product.id,
              sku: product.sku,
              name: product.name,
              source: "view",
              estimated_revenue: product.member_price,
            },
          ]}
        />
      ) : null}
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {crumbs.map((crumb) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <Link href={crumb.href} className="hover:text-vm-primary">
                {crumb.label}
              </Link>
              <span aria-hidden="true">/</span>
            </li>
          ))}
          <li className="font-semibold text-foreground" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <PantryProductGallery
          images={gallery}
          alt={product.name}
          badge={product.origin_label}
        />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-vm-primary">
            {product.brand}
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>
            <button
              type="button"
              onClick={() => toggleGrocery(product)}
              aria-pressed={saved}
              aria-label={
                saved
                  ? `Remove ${product.name} from grocery list`
                  : `Save ${product.name} to grocery list`
              }
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-vm-primary transition-colors hover:bg-vm-primary/10"
            >
              <Heart className={`h-5 w-5 ${saved ? "fill-vm-primary" : ""}`} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MultibuyBadge product={product} className="px-2 py-1 text-xs" />
            {savePercent > 0 ? (
              <span className="rounded-sm border border-vm-secondary/30 bg-vm-secondary/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-vm-secondary">
                {savePercent}% off
              </span>
            ) : null}
            {product.health_star_rating != null ? (
              <HealthStarBadge rating={product.health_star_rating} />
            ) : null}
            {product.natural_flavours_or_colours ? (
              <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-foreground">
                Natural flavours or colours
              </span>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div>
              <span className="inline-flex items-center rounded-sm border border-vm-secondary/30 bg-vm-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-vm-secondary">
                Member Price
              </span>
              <p className="mt-1 text-3xl font-bold text-vm-primary">
                {formatNzPrice(product.member_price)}
              </p>
            </div>
            <div className="pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                Retail Price
              </p>
              <p className="text-lg text-muted-light line-through">
                {formatNzPrice(product.retail_price)}
              </p>
            </div>
          </div>
          {unitPrice ? <p className="mt-2 text-sm text-muted">{unitPrice}</p> : null}

          {multibuy && multibuyLabel && product.multibuy_quantity != null && product.multibuy_price != null ? (
            <div className="mt-6 rounded-lg border-2 border-[#F59E0B] bg-gradient-to-r from-[#F59E0B] to-[#EAB308] px-4 py-3 text-[#78350F] shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.16em]">Multi-Buy Deal</p>
              <p className="mt-1 text-2xl font-black tracking-tight">{multibuyLabel}</p>
              <p className="mt-1 text-sm font-semibold">
                {multibuySavings > 0
                  ? `Save ${formatNzPrice(multibuySavings)} when you buy ${product.multibuy_quantity} versus the member unit price.`
                  : `Buy ${product.multibuy_quantity} for ${formatNzPrice(product.multibuy_price)} instead of paying each item separately.`}
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="inline-flex h-12 items-center rounded-md border border-border">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="inline-flex h-12 w-11 items-center justify-center text-foreground hover:bg-surface"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(product.stock_quantity || 99, current + 1)
                  )
                }
                className="inline-flex h-12 w-11 items-center justify-center text-foreground hover:bg-surface"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(product, quantity)}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-vm-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to Cart"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">SKU {product.sku}</p>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-background px-4 sm:px-6">
        <AccordionBlock title="Product Details" defaultOpen>
          {product.description || "Product details will appear here when published."}
        </AccordionBlock>
        <AccordionBlock title="Ingredients">
          {product.ingredients || "Ingredient information is not available for this product."}
        </AccordionBlock>
        <AccordionBlock title="Allergens">
          {product.allergens || "Allergen information is not available for this product."}
        </AccordionBlock>
        <AccordionBlock title="Nutrition Information">
          {product.nutrition_facts ? (
            <div className="overflow-x-auto">
              <p className="mb-3 text-xs text-muted">
                Serving size {product.nutrition_facts.serving_size} ·{" "}
                {product.nutrition_facts.servings_per_pack} servings per pack
              </p>
              <table className="w-full min-w-[20rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3 font-semibold">Nutrient</th>
                    <th className="py-2 pr-3 font-semibold">Per serve</th>
                    <th className="py-2 font-semibold">Per 100g</th>
                  </tr>
                </thead>
                <tbody>
                  {product.nutrition_facts.rows.map((row) => (
                    <tr key={row.label} className="border-b border-border/70">
                      <td className="py-2 pr-3 font-medium text-foreground">{row.label}</td>
                      <td className="py-2 pr-3">{row.per_serve}</td>
                      <td className="py-2">{row.per_100g}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            "Nutrition information is not available for this product."
          )}
        </AccordionBlock>
      </div>
    </div>
  );
}
