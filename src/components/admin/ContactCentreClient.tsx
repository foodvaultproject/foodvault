"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatCard, StatusBadge, formatAdminDate } from "@/components/admin/AdminUi";
import { updateEnquiryAction } from "@/lib/admin/actions";
import type { ContactEnquiryRow } from "@/lib/admin/types";

type Stats = {
  active: number;
  avgResponse: string;
  resolvedToday: number;
  priority: number;
};

const STATUSES = ["NEW", "OPEN", "RESOLVED", "CLOSED"];

export function ContactCentreClient({
  stats,
  enquiries,
  initialSearch,
}: {
  stats: Stats;
  enquiries: ContactEnquiryRow[];
  initialSearch: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [selected, setSelected] = useState<ContactEnquiryRow | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openDetail(enquiry: ContactEnquiryRow) {
    setSelected(enquiry);
    setNotes(enquiry.internal_notes ?? "");
    setStatus(enquiry.status);
    setError(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`/admin/contact${params.toString() ? `?${params}` : ""}`);
  }

  function handleSave() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await updateEnquiryAction(selected.id, {
        status,
        internal_notes: notes,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setSelected(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact Centre</h1>
        <p className="mt-1 text-sm text-muted">Manage member and partner support enquiries</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Enquiries" value={stats.active} />
        <StatCard label="Avg Response" value={stats.avgResponse} />
        <StatCard label="Resolved Today" value={stats.resolvedToday} />
        <StatCard label="Priority Queue" value={stats.priority} />
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference, name, or subject..."
          className="max-w-md flex-1 rounded border border-border px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          Search
        </button>
      </form>

      <div className="flex gap-6">
        <div className={`min-w-0 flex-1 ${selected ? "lg:max-w-[calc(100%-400px)]" : ""}`}>
          <div className="overflow-hidden rounded border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Ref</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">From</th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted md:table-cell">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted lg:table-cell">Received</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      No enquiries found
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      onClick={() => openDetail(enquiry)}
                      className={`cursor-pointer border-b border-border last:border-0 hover:bg-surface ${
                        selected?.id === enquiry.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted">{enquiry.reference_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{enquiry.name}</p>
                        <p className="text-xs text-muted">{enquiry.enquiry_type}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-muted md:table-cell">{enquiry.subject}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={enquiry.status} />
                      </td>
                      <td className="hidden px-4 py-3 text-muted lg:table-cell">
                        {formatAdminDate(enquiry.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected ? (
          <aside className="w-full shrink-0 rounded border border-border bg-white lg:w-[380px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">{selected.reference_number}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-muted hover:text-foreground"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[50vh] space-y-4 overflow-y-auto p-5">
              <Detail label="From" value={`${selected.name} (${selected.email})`} />
              <Detail label="Type" value={selected.enquiry_type} />
              <Detail label="Subject" value={selected.subject} />
              <Detail label="Message" value={selected.message} />
              <Detail label="Received" value={formatAdminDate(selected.created_at)} />
            </div>
            <div className="space-y-4 border-t border-border p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="button"
                disabled={pending}
                onClick={handleSave}
                className="w-full fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
              >
                Save Changes
              </button>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
