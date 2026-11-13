import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockUpInvoice } from "@/components/account/StockUpInvoice";
import { getMemberVaultMarketOrder } from "@/lib/commerce/member-orders";
import { requireAuthenticatedMember } from "@/lib/member/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tax Invoice",
  description: "StockUp tax invoice.",
};

export default async function StockUpInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ autoprint?: string }>;
}) {
  const { orderId } = await params;
  const { autoprint } = await searchParams;
  const member = await requireAuthenticatedMember();
  const order = await getMemberVaultMarketOrder(member.id, orderId);
  if (!order) notFound();
  return (
    <StockUpInvoice
      order={order}
      autoprint={autoprint === "true" || autoprint === "1"}
    />
  );
}
