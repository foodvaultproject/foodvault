import { notFound } from "next/navigation";
import { PickerOrderClient } from "@/components/admin/picker/PickerOrderClient";
import { getPickerOrder } from "@/lib/admin/picker";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function PickerOrderPage({ params }: Props) {
  const { orderId } = await params;
  const order = await getPickerOrder(orderId);
  if (!order) notFound();

  return <PickerOrderClient order={order} />;
}
