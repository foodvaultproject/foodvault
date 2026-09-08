import { CreditNotesListClient } from "@/components/admin/wms/CreditNotesListClient";
import { listCreditNotes } from "@/lib/admin/wms";

export const dynamic = "force-dynamic";

export default async function AdminCreditNotesPage() {
  const notes = await listCreditNotes();
  return <CreditNotesListClient notes={notes} />;
}
