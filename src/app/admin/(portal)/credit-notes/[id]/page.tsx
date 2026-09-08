import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/AdminUi";
import { getCreditNote } from "@/lib/admin/wms";
import { discrepancyLabel } from "@/lib/admin/wms-shared";
import { formatNzPrice } from "@/lib/partner-offer";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminCreditNotePage({ params }: Props) {
  const { id } = await params;
  const note = await getCreditNote(id);
  if (!note) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/credit-notes" className="text-sm font-semibold text-muted hover:text-primary">
        ← Back to credit notes
      </Link>
      <div>
        <h1 className="font-mono text-2xl font-bold text-foreground">{note.creditNumber}</h1>
        <p className="mt-1 text-sm text-muted">
          {note.vendorName}
          {note.poNumber ? ` · ${note.poNumber}` : ""}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <StatusBadge label={note.status === "draft" ? "DRAFT" : "OPEN"} />
          <p className="text-lg font-bold text-foreground">{formatNzPrice(note.totalClaim)}</p>
        </div>
        {note.reasonSummary ? <p className="mt-2 text-sm text-muted">{note.reasonSummary}</p> : null}
      </div>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Qty</th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">Claim</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {note.items.map((item) => (
              <tr key={item.id} className="border-b border-border/70 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{item.sku || "—"}</td>
                <td className="px-4 py-3 font-semibold">{item.name || "—"}</td>
                <td className="px-4 py-3 tabular-nums">{item.discrepancyQty}</td>
                <td className="px-4 py-3">{formatNzPrice(item.costPrice)}</td>
                <td className="px-4 py-3">{formatNzPrice(item.lineTotal)}</td>
                <td className="px-4 py-3 text-muted">{discrepancyLabel(item.reason)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
