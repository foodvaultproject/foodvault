"use client";

import { useMemo, useState } from "react";
import type {
  AdminAffiliateBrandRow,
  AdminAffiliateRow,
  AdminAffiliateStats,
} from "@/lib/admin/types";

type AffiliatesClientProps = {
  stats: AdminAffiliateStats;
  affiliates: AdminAffiliateRow[];
  brands: AdminAffiliateBrandRow[];
};

export function AffiliatesClient({
  stats,
  affiliates: initialAffiliates,
  brands: initialBrands,
}: AffiliatesClientProps) {
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const affiliates = useMemo(() => {
    const q = affiliateSearch.trim().toLowerCase();
    if (!q) return initialAffiliates;
    return initialAffiliates.filter(
      (row) =>
        row.email.toLowerCase().includes(q) ||
        row.first_name.toLowerCase().includes(q) ||
        row.last_name.toLowerCase().includes(q) ||
        row.referral_code.toLowerCase().includes(q)
    );
  }, [affiliateSearch, initialAffiliates]);

  const brands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return initialBrands;
    return initialBrands.filter(
      (row) =>
        row.business_name?.toLowerCase().includes(q) ||
        row.slug?.toLowerCase().includes(q)
    );
  }, [brandSearch, initialBrands]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Affiliates</h1>
        <p className="mt-2 text-sm text-muted">
          View-only overview of affiliate accounts, participating brands, and click activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Affiliates", value: stats.totalAffiliates },
          { label: "Participating Brands", value: stats.participatingBrands },
          { label: "Referral Links Generated", value: stats.referralLinksGenerated },
          { label: "Total Clicks", value: stats.totalClicks },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-[#0f172a]">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-[#0f172a]">Affiliates</h2>
          <input
            value={affiliateSearch}
            onChange={(e) => setAffiliateSearch(e.target.value)}
            placeholder="Search affiliates..."
            className="w-full max-w-sm rounded-md border border-border px-4 py-2.5 text-sm"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Referral Code</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((row) => (
                <tr key={row.id} className="border-b border-border/70">
                  <td className="px-3 py-3 font-medium text-[#0f172a]">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="px-3 py-3 text-muted">{row.email}</td>
                  <td className="px-3 py-3 text-muted">{row.referral_code}</td>
                  <td className="px-3 py-3 text-muted">{row.country}</td>
                  <td className="px-3 py-3 text-muted">{row.status}</td>
                  <td className="px-3 py-3 text-muted">
                    {new Date(row.created_at).toLocaleDateString("en-NZ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {affiliates.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted">No affiliates found.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-[#0f172a]">Participating Brands</h2>
          <input
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brands..."
            className="w-full max-w-sm rounded-md border border-border px-4 py-2.5 text-sm"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Commission</th>
                <th className="px-3 py-2">Program Enabled</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((row) => (
                <tr key={row.id} className="border-b border-border/70">
                  <td className="px-3 py-3 font-medium text-[#0f172a]">
                    {row.business_name ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-muted">{row.slug ?? "—"}</td>
                  <td className="px-3 py-3 text-muted">
                    {row.affiliate_commission_percent != null
                      ? `${row.affiliate_commission_percent}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-muted">
                    {row.affiliate_enabled ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {brands.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted">No participating brands found.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
