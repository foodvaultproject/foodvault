import { PickerQueueClient } from "@/components/admin/picker/PickerQueueClient";
import { listPickerQueue } from "@/lib/admin/picker";
import type { PickerQueueTab } from "@/lib/admin/picker-shared";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function PickerQueuePage({ searchParams }: Props) {
  const { tab: rawTab } = await searchParams;
  const tab: PickerQueueTab = rawTab === "fulfilled" ? "fulfilled" : "pick";
  const orders = await listPickerQueue(tab);

  return <PickerQueueClient tab={tab} orders={orders} />;
}
