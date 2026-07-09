"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusBadge, formatAdminDate } from "@/components/admin/AdminUi";
import { deletePartnerAction, suspendPartnerAction } from "@/lib/admin/actions";
import { getPartnerStatusBadge, type PartnerRow } from "@/lib/admin/types";

export function PartnersClient({
  partners,
  initialSearch,
}: {
  partners: PartnerRow[];
  initialSearch: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [pending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`/admin/partners${params.toString() ? `?${params}` : ""}`);
  }

  function handleSuspend(partner: PartnerRow) {
    startTransition(async () => {
      await suspendPartnerAction(partner.id, !partner.suspended);
      router.refresh();
    });
  }

  function handleDelete(partnerId: string) {
    if (!confirm("Delete this partner permanently?")) return;
    startTransition(async () => {
      await deletePartnerAction(partnerId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Partners</h1>
        <p className="mt-1 text-sm text-muted">Manage live and pending partner listings</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, or location..."
          className="max-w-md flex-1 rounded border border-border px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Business</th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted md:table-cell">Category</th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted lg:table-cell">Location</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:table-cell">Approved</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No partners found
                </td>
              </tr>
            ) : (
              partners.map((partner) => (
                <tr key={partner.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{partner.business_name ?? "—"}</p>
                    {partner.member_code ? (
                      <p className="font-mono text-xs text-muted">{partner.member_code}</p>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">{partner.primary_category ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-muted lg:table-cell">{partner.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={getPartnerStatusBadge(partner)} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">
                    {partner.approved_at ? formatAdminDate(partner.approved_at) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleSuspend(partner)}
                        className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                      >
                        {partner.suspended ? "Restore" : "Suspend"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDelete(partner.id)}
                        className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
