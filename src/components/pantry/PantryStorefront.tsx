"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { LostSaleTracker } from "@/components/pantry/LostSaleTracker";
import { PantryHeroBanner } from "@/components/pantry/PantryHeroBanner";
import { PantryProductCard } from "@/components/pantry/PantryProductCard";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import { filterCatalogProducts, hasSaverPrice, offerPrice } from "@/lib/commerce/catalog";

export function StockUpCatalog({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const browsing = !["q", "department", "subcategory", "specific", "deals"].some((key) =>
    params.get(key)
  );

  return (
    <>
      <div className="mx-auto min-w-0 max-w-[1200px] px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-6 md:pb-16 md:pt-8 lg:px-8">
        <PantryStorefront />
      </div>
      {browsing ? children : null}
    </>
  );
}

export function PantryStorefront() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const department = params.get("department") ?? "";
  const subcategory = params.get("subcategory") ?? "";
  const specific = params.get("specific") ?? "";
  const deals = params.get("deals") === "1";
  const { products, liveQuery } = usePantryMarket();
  const matched = filterCatalogProducts(products, {
    query: liveQuery || query,
    department,
    subcategory,
    specific,
  });
  const filtered = deals
    ? matched.filter(
        (product) => product.is_multibuy || hasSaverPrice(product)
      )
    : matched;

  const searchTerm = liveQuery || query;
  const lostSearchEvents = searchTerm
    ? filtered
        .filter((product) => product.stock_quantity <= 0)
        .slice(0, 12)
        .map((product) => ({
          product_id: product.id,
          sku: product.sku,
          name: product.name,
          source: "search" as const,
          search_query: searchTerm,
          estimated_revenue: offerPrice(product),
        }))
    : [];

  return (
    <div>
      <LostSaleTracker events={lostSearchEvents} />
      <PantryHeroBanner />
      {deals ? (
        <h2 className="mt-6 text-xl font-bold text-foreground">Deals</h2>
      ) : null}

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-background px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-foreground">
            {products.length === 0
              ? "The StockUp supermarket is getting ready"
              : deals
                ? "No deals found"
                : "No products found"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {products.length === 0
              ? "Real pantry products will appear here once they are uploaded."
              : "Try another search, or browse a different category from the menu above."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
          {filtered.map((product) => (
            <PantryProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
