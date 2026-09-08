import { PantryReportsClient } from "@/components/admin/pantry/PantryReportsClient";
import { getPantryReportData } from "@/lib/admin/pantry";

export default async function AdminPantryReportsPage() {
  const data = await getPantryReportData();
  return <PantryReportsClient data={data} />;
}
