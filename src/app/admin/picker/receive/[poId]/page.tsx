import { notFound } from "next/navigation";
import { PickerReceiveClient } from "@/components/admin/picker/PickerReceiveClient";
import { getPurchaseOrder } from "@/lib/admin/wms";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ poId: string }>;
};

export default async function PickerReceivePoPage({ params }: Props) {
  const { poId } = await params;
  const order = await getPurchaseOrder(poId);
  if (!order) notFound();
  return <PickerReceiveClient order={order} />;
}
