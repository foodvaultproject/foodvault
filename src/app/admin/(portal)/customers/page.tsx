import { StockUpCustomersClient } from "@/components/admin/StockUpCustomersClient";
import { listStockUpCustomers } from "@/lib/admin/stockup-customers";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function StockUpCustomersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const { customers, warning } = await listStockUpCustomers(q ?? "");
  return <StockUpCustomersClient customers={customers} initialSearch={q ?? ""} warning={warning} />;
}
