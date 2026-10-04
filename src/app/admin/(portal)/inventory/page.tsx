import { InventoryClient } from "@/components/admin/pantry/InventoryClient";
import { listAdminProducts, listInventoryBatches, listInventorySales } from "@/lib/admin/pantry";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AdminInventoryPage({ searchParams }: Props) {
  const { tab: rawTab } = await searchParams;
  const tab = rawTab === "movements" ? "movements" : "stock";
  const [products, batches, sales] = await Promise.all([
    listAdminProducts(),
    listInventoryBatches(),
    listInventorySales(),
  ]);

  return <InventoryClient tab={tab} products={products} batches={batches} sales={sales} />;
}
