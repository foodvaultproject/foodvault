import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockUpInvoice } from "@/components/account/StockUpInvoice";
import { getMemberVaultMarketOrder } from "@/lib/commerce/member-orders";
import { requireAuthenticatedMember } from "@/lib/member/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice",
  description: "StockUp order invoice.",
};

export default async function StockUpInvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const member = await requireAuthenticatedMember();
  const order = await getMemberVaultMarketOrder(member.id, orderId);
  if (!order) notFound();
  return <StockUpInvoice order={order} />;
}
