import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockUpInvoice } from "@/components/account/StockUpInvoice";
import { getPackingSlipOrder } from "@/lib/admin/packing-slip";
import { verifyStockUpInvoiceToken } from "@/lib/commerce/invoice-access";
import {
  courierTrackingUrl,
  memberOrderDisplayStatus,
  type MemberOrderHistoryItem,
} from "@/lib/commerce/member-orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tax Invoice",
  description: "StockUp tax invoice.",
};

export default async function GuestStockUpInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ autoprint?: string; token?: string }>;
}) {
  const { orderId } = await params;
  const { autoprint, token } = await searchParams;
  if (!verifyStockUpInvoiceToken(orderId, token)) notFound();

  const packing = await getPackingSlipOrder(orderId);
  if (!packing) notFound();

  const order: MemberOrderHistoryItem = {
    id: packing.id,
    shortId: packing.shortId,
    createdAt: packing.createdAt,
    total: packing.total,
    subtotal: packing.subtotal,
    totalSavings: packing.totalSavings,
    status: "fulfilled",
    displayStatus: memberOrderDisplayStatus("fulfilled", packing.trackingNumber),
    trackingNumber: packing.trackingNumber,
    trackingUrl: packing.trackingNumber ? courierTrackingUrl(packing.trackingNumber) : null,
    thumbnails: [],
    reorderLines: [],
    lines: packing.lines.map((line) => ({
      name: line.name,
      quantity: line.picked,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
    })),
    shippingName: packing.customerName,
    shippingEmail: packing.customerEmail,
    shippingPhone: packing.customerPhone,
    shippingAddress: packing.addressLines.join(", ") || null,
    shippingCost: packing.shippingCost,
  };

  return (
    <StockUpInvoice
      order={order}
      autoprint={autoprint === "true" || autoprint === "1"}
      guest
    />
  );
}
