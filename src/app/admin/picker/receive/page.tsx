import { PickerMobileTabs } from "@/components/admin/picker/PickerQueueClient";
import { PickerReceiveQueueClient } from "@/components/admin/picker/PickerReceiveQueueClient";
import { listPurchaseOrders } from "@/lib/admin/wms";

export const dynamic = "force-dynamic";

export default async function PickerReceiveQueuePage() {
  const orders = (await listPurchaseOrders()).filter(
    (order) => order.status === "open" || order.status === "receiving"
  );

  return (
    <>
      <div className="mx-auto w-full max-w-xl px-4 pt-4">
        <PickerMobileTabs tab="receive" />
      </div>
      <PickerReceiveQueueClient orders={orders} />
    </>
  );
}
