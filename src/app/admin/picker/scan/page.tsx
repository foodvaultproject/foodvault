import { PickerMobileTabs } from "@/components/admin/picker/PickerQueueClient";
import { PickerScanLookupClient } from "@/components/admin/picker/PickerScanLookupClient";

export const dynamic = "force-dynamic";

export default function PickerScanPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-xl px-4 pt-4">
        <PickerMobileTabs tab="scan" />
      </div>
      <PickerScanLookupClient />
    </>
  );
}
