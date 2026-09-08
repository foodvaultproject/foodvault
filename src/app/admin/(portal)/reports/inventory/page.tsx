import { InventoryReportsClient } from "@/components/admin/reports/InventoryReportsClient";
import { getInventoryReport } from "@/lib/admin/market-reports";

export const dynamic = "force-dynamic";

export default async function AdminInventoryReportsPage() {
  const data = await getInventoryReport();
  return <InventoryReportsClient data={data} />;
}
