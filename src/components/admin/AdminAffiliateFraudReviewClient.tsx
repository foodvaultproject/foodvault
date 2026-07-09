"use client";

import { useMemo, useState, useTransition } from "react";
import {
  getAdminFraudFlags,
  updateAdminFraudFlagStatus,
  type FraudFlagRow,
} from "@/lib/fraud-service/queries";

type AdminAffiliateFraudReviewClientProps = {
  initialFlags: FraudFlagRow[];
};

const FLAG_LABELS: Record<string, string> = {
  click_spike: "Click Spike",
  repeat_ip: "Repeat IP",
  rapid_clicks: "Rapid Clicks",
  possible_self_referral: "Possible Self-Referral",
  abnormal_traffic: "Abnormal Traffic",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  dismissed: "bg-slate-100 text-slate-700",
  investigated: "bg-emerald-100 text-emerald-800",
};

function affiliateName(row: FraudFlagRow) {
  const name = `${row.affiliateFirstName ?? ""} ${row.affiliateLastName ?? ""}`.trim();
  return name || row.affiliateEmail || "Unknown affiliate";
}

export function AdminAffiliateFraudReviewClient({
  initialFlags,
}: AdminAffiliateFraudReviewClientProps) {
  const [flags, setFlags] = useState(initialFlags);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<FraudFlagRow | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!statusFilter) return flags;
    return flags.filter((row) => row.status === statusFilter);
  }, [flags, statusFilter]);

  async function refreshFlags(nextStatus?: string) {
    const rows = await getAdminFraudFlags(nextStatus || undefined);
    setFlags(rows);
  }

  function handleReview(row: FraudFlagRow) {
    setSelected(row);
    setNotes("");
    setMessage(null);
  }

  function handleDismiss() {
    if (!selected) return;
    startTransition(async () => {
      const result = await updateAdminFraudFlagStatus(selected.id, "dismissed", notes || undefined);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Flag dismissed. Audit log updated.");
      setSelected(null);
      await refreshFlags(statusFilter || undefined);
    });
  }

  function handleInvestigated() {
    if (!selected) return;
    startTransition(async () => {
      const result = await updateAdminFraudFlagStatus(selected.id, "investigated", notes || undefined);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Flag marked as investigated. Audit log updated.");
      setSelected(null);
      await refreshFlags(statusFilter || undefined);
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Affiliate Fraud Review</h1>
        <p className="mt-2 text-sm text-muted">
          Review suspicious referral activity flagged by automated detection. Commissions are never
          auto-rejected.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-[#0f172a]">Fraud Flags</h2>
          <select
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value);
              startTransition(async () => {
                await refreshFlags(value || undefined);
              });
            }}
            className="rounded-lg border border-border px-4 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="dismissed">Dismissed</option>
            <option value="investigated">Investigated</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Flag Type</th>
                <th className="px-3 py-2">Affiliate</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Click Count</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted">
                    No fraud flags found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-3 py-3 font-medium text-[#0f172a]">
                      {FLAG_LABELS[row.flagType] ?? row.flagType}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-[#0f172a]">{affiliateName(row)}</div>
                      {row.affiliateEmail ? (
                        <div className="text-xs text-muted">{row.affiliateEmail}</div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-muted">{row.brandName ?? "—"}</td>
                    <td className="px-3 py-3 text-muted">{row.clickCount ?? "—"}</td>
                    <td className="px-3 py-3 text-muted">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString("en-NZ") : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_STYLES[row.status] ?? STATUS_STYLES.open
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleReview(row)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0f172a]">Review Flag</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Flag Type</dt>
              <dd className="mt-1 font-medium text-[#0f172a]">
                {FLAG_LABELS[selected.flagType] ?? selected.flagType}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Affiliate</dt>
              <dd className="mt-1 font-medium text-[#0f172a]">{affiliateName(selected)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Brand</dt>
              <dd className="mt-1 text-[#0f172a]">{selected.brandName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Click Count</dt>
              <dd className="mt-1 text-[#0f172a]">{selected.clickCount ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">IP Hash</dt>
              <dd className="mt-1 break-all font-mono text-xs text-muted">
                {selected.ipHash ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Created</dt>
              <dd className="mt-1 text-[#0f172a]">
                {selected.createdAt ? new Date(selected.createdAt).toLocaleString("en-NZ") : "—"}
              </dd>
            </div>
          </dl>

          <label className="mt-6 block text-sm font-medium text-[#0f172a]">
            Review notes (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-md border border-border px-4 py-2.5 text-sm"
              placeholder="Internal notes for audit trail..."
            />
          </label>

          {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={handleDismiss}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted hover:bg-surface disabled:opacity-50"
            >
              Dismiss
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleInvestigated}
              className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-50"
            >
              Mark as Investigated
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted hover:text-[#0f172a]"
            >
              Close
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
