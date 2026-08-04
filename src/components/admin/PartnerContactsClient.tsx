"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/AdminUi";
import {
  PARTNER_CONTACT_STATUS_FILTER_OPTIONS,
  partnerContactFiltersQueryString,
  type PartnerContactFilters,
} from "@/lib/admin/partner-contacts-filters";
import type { PartnerContactRow } from "@/lib/admin/types";

const FILTER_INPUT_CLASS =
  "w-full min-w-[7rem] rounded border border-border bg-white px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function PartnerContactsClient({
  contacts,
  initialFilters,
}: {
  contacts: PartnerContactRow[];
  initialFilters: PartnerContactFilters;
}) {
  const router = useRouter();
  const [business, setBusiness] = useState(initialFilters.business ?? "");
  const [contact, setContact] = useState(initialFilters.contact ?? "");
  const [email, setEmail] = useState(initialFilters.email ?? "");
  const [phone, setPhone] = useState(initialFilters.phone ?? "");
  const [status, setStatus] = useState(initialFilters.status ?? "");

  function buildFilters(): PartnerContactFilters {
    return {
      business: business.trim() || undefined,
      contact: contact.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      status: status === "Live" || status === "Pending Activation" ? status : undefined,
    };
  }

  function applyFilters() {
    router.push(`/admin/partner-contacts${partnerContactFiltersQueryString(buildFilters())}`);
  }

  function resetFilters() {
    setBusiness("");
    setContact("");
    setEmail("");
    setPhone("");
    setStatus("");
    router.push("/admin/partner-contacts");
  }

  function handleFilterKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyFilters();
    }
  }

  const exportQuery = partnerContactFiltersQueryString(initialFilters);

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

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={applyFilters}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center justify-center rounded-sm border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="min-w-[960px] w-full text-left text-sm">
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
            <tr className="border-b border-border bg-surface/40">
              <th className="px-2 py-2 font-normal">
                <input
                  type="search"
                  value={business}
                  onChange={(event) => setBusiness(event.target.value)}
                  onKeyDown={handleFilterKeyDown}
                  placeholder="Filter business..."
                  aria-label="Filter by business name"
                  className={FILTER_INPUT_CLASS}
                />
              </th>
              <th className="px-2 py-2 font-normal">
                <input
                  type="search"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  onKeyDown={handleFilterKeyDown}
                  placeholder="Filter contact..."
                  aria-label="Filter by contact name"
                  className={FILTER_INPUT_CLASS}
                />
              </th>
              <th className="px-2 py-2 font-normal">
                <input
                  type="search"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={handleFilterKeyDown}
                  placeholder="Filter email..."
                  aria-label="Filter by customer support email"
                  className={FILTER_INPUT_CLASS}
                />
              </th>
              <th className="px-2 py-2 font-normal">
                <input
                  type="search"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  onKeyDown={handleFilterKeyDown}
                  placeholder="Filter phone..."
                  aria-label="Filter by support phone"
                  className={FILTER_INPUT_CLASS}
                />
              </th>
              <th className="px-2 py-2 font-normal">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Filter by status"
                  className={FILTER_INPUT_CLASS}
                >
                  {PARTNER_CONTACT_STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
              contacts.map((contactRow) => (
                <tr
                  key={contactRow.id}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {contactRow.business_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {contactRow.contact_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {contactRow.support_email ? (
                      <a
                        href={`mailto:${contactRow.support_email}`}
                        className="text-primary hover:underline"
                      >
                        {contactRow.support_email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {contactRow.support_phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {contactRow.status ? (
                      <StatusBadge label={contactRow.status} />
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
