import { VendorsListClient } from "@/components/admin/wms/VendorsListClient";
import { listVendors } from "@/lib/admin/wms";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const vendors = await listVendors();
  return <VendorsListClient vendors={vendors} />;
}
