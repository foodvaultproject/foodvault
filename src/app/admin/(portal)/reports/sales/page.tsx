import { SalesReportsClient } from "@/components/admin/reports/SalesReportsClient";
import { getSalesReport, resolveReportRange } from "@/lib/admin/market-reports";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
};

export default async function AdminSalesReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = resolveReportRange(params);
  const data = await getSalesReport(range);
  return <SalesReportsClient data={data} />;
}
