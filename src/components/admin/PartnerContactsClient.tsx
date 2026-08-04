"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/AdminUi";
import type { PartnerContactRow } from "@/lib/admin/types";

export function PartnerContactsClient({
  contacts,
  initialSearch,
}: {
  contacts: PartnerContactRow[];
  initialSearch: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`/admin/partner-contacts${params.toString() ? `?${params}` : ""}`);
  }

  const exportQuery = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Contacts</h1>
          <p className="mt-1 text-sm text-muted">
            Internal partner contact details from brand applications — contact name,
            customer support email, and support phone.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/api/admin/export/partner-contacts${exportQuery}`}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
          >
            Export CSV
          </Link>
          <Link
            href={`/api/admin/export/partner-contacts${exportQuery}${exportQuery ? "&" : "?"}format=excel`}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
          >
            Export Excel
          </Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by business, contact, email, or phone..."
          className="max-w-md flex-1 rounded border border-border px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Business Name
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Contact Name
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Customer Support Email
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Support Phone
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  No partner contacts found
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {contact.business_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground">{contact.contact_name ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">
                    {contact.support_email ? (
                      <a
                        href={`mailto:${contact.support_email}`}
                        className="text-primary hover:underline"
                      >
                        {contact.support_email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground">{contact.support_phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {contact.status ? (
                      <StatusBadge label={contact.status} />
                    ) : (
                      "—"
                    )}
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
