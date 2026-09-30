"use client";

import { LostSaleTracker } from "@/components/pantry/LostSaleTracker";
import { PantryHeroBanner } from "@/components/pantry/PantryHeroBanner";
import { PantryProductCard } from "@/components/pantry/PantryProductCard";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import { filterCatalogProducts } from "@/lib/commerce/catalog";

export function PantryStorefront({
  query = "",
  department = "",
  subcategory = "",
  specific = "",
}: {
  query?: string;
  department?: string;
  subcategory?: string;
  specific?: string;
}) {
  const { products, liveQuery } = usePantryMarket();
  const filtered = filterCatalogProducts(products, {
    query: liveQuery || query,
    department,
    subcategory,
    specific,
  });

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
          estimated_revenue: product.member_price,
        }))
    : [];

  return (
    <div>
      <LostSaleTracker events={lostSearchEvents} />
      <PantryHeroBanner />

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-background px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-foreground">
            {products.length === 0 ? "The FoodVault supermarket is getting ready" : "No products found"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {products.length === 0
              ? "Real pantry products will appear here once they are uploaded."
              : "Try another search, or browse a different category from the menu above."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
          {filtered.map((product) => (
            <PantryProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
