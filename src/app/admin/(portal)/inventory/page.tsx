import { InventoryClient } from "@/components/admin/pantry/InventoryClient";
import { listAdminProducts, listInventoryBatches, listInventorySales } from "@/lib/admin/pantry";

export default async function AdminInventoryPage() {
  const [products, batches, sales] = await Promise.all([
    listAdminProducts(),
    listInventoryBatches(),
    listInventorySales(),
  ]);

  return <InventoryClient products={products} batches={batches} sales={sales} />;
}
