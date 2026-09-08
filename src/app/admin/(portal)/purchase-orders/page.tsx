import { PurchaseOrdersListClient } from "@/components/admin/wms/PurchaseOrdersListClient";
import { listPurchaseOrders } from "@/lib/admin/wms";

export const dynamic = "force-dynamic";

export default async function AdminPurchaseOrdersPage() {
  const orders = await listPurchaseOrders();
  return <PurchaseOrdersListClient orders={orders} />;
}
