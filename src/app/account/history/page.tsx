import type { Metadata } from "next";
import { StockUpHistory } from "@/components/account/StockUpHistory";
import { getMemberVaultMarketOrders } from "@/lib/commerce/member-orders";
import { requireAuthenticatedMember } from "@/lib/member/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My History",
  description: "StockUp orders and invoices.",
};

export default async function StockUpHistoryPage() {
  const member = await requireAuthenticatedMember();
  const orders = await getMemberVaultMarketOrders(member.id);
  return <StockUpHistory orders={orders} />;
}
