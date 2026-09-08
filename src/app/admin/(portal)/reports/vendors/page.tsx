import { VendorReportsClient } from "@/components/admin/reports/VendorReportsClient";
import { getVendorReport } from "@/lib/admin/market-reports";

export const dynamic = "force-dynamic";

export default async function AdminVendorReportsPage() {
  const data = await getVendorReport();
  return <VendorReportsClient data={data} />;
}
