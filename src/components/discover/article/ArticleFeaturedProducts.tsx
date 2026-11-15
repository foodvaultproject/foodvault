import { PantryProductCard } from "@/components/pantry/PantryProductCard";
import type { FoodVaultProduct } from "@/types/commerce";

export function ArticleFeaturedProducts({ products }: { products: FoodVaultProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="text-2xl font-bold tracking-tight text-[#064E3B]">Shop Featured Pantry Items</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <PantryProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
