"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/admin/AdminUi";
import { formatNzPrice } from "@/lib/partner-offer";
import { discrepancyLabel, type CreditNoteRecord } from "@/lib/admin/wms-shared";

export function CreditNotesListClient({ notes }: { notes: CreditNoteRecord[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Credit notes</h1>
        <p className="mt-1 text-sm text-muted">
          Draft claims created when received quantity is short, damaged, or expired.
        </p>
      </div>
      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Credit</th>
              <th className="px-4 py-3 font-semibold">Vendor</th>
              <th className="px-4 py-3 font-semibold">PO</th>
              <th className="px-4 py-3 font-semibold">Claim</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                  No credit notes yet. Complete a short or damaged receipt to generate a draft claim.
                </td>
              </tr>
            ) : (
              notes.map((note) => (
                <tr key={note.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold">{note.creditNumber}</td>
                  <td className="px-4 py-3">{note.vendorName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{note.poNumber || "—"}</td>
                  <td className="px-4 py-3">{formatNzPrice(note.totalClaim)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={note.status === "draft" ? "DRAFT" : note.status === "settled" ? "RESOLVED" : "OPEN"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/credit-notes/${note.id}`} className="text-sm font-semibold text-primary">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {notes[0] ? (
        <p className="text-xs text-muted">
          Latest claim reason: {discrepancyLabel(notes[0].items[0]?.reason) || notes[0].reasonSummary || "—"}
        </p>
      ) : null}
    </div>
  );
}
