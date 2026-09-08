import { Suspense, type ReactNode } from "react";
import { PantryMarketHeader } from "@/components/pantry/PantryMarketHeader";
import { PantryMarketProvider } from "@/components/pantry/PantryMarketProvider";
import { getActiveVaultMarketProducts } from "@/lib/commerce/products";

export default async function PantryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const products = await getActiveVaultMarketProducts();

  return (
    <PantryMarketProvider products={products}>
      <Suspense fallback={null}>
        <PantryMarketHeader />
      </Suspense>
      {children}
    </PantryMarketProvider>
  );
}
