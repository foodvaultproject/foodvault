import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackingSlipView } from "@/components/admin/picker/PackingSlipView";
import { getPackingSlipOrder } from "@/lib/admin/packing-slip";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ autoprint?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `Packing slip ${orderId.replace(/-/g, "").slice(-8).toUpperCase()}` };
}

export default async function PackingSlipPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const { autoprint } = await searchParams;
  const order = await getPackingSlipOrder(orderId);
  if (!order) notFound();

  return <PackingSlipView order={order} autoprint={autoprint === "true"} />;
}
