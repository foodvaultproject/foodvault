import { InventoryClient } from "@/components/admin/pantry/InventoryClient";
import { listAdminProducts, listInventoryBatches } from "@/lib/admin/pantry";

export default async function AdminInventoryPage() {
  const [products, batches] = await Promise.all([
    listAdminProducts(),
    listInventoryBatches(),
  ]);

  return <InventoryClient products={products} batches={batches} />;
}
