"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminAffiliateAnalytics } from "@/lib/partner-affiliate/analytics";

type AdminAffiliateAnalyticsClientProps = {
  analytics: AdminAffiliateAnalytics;
};

export function AdminAffiliateAnalyticsClient({
  analytics,
}: AdminAffiliateAnalyticsClientProps) {
  const [brandSearch, setBrandSearch] = useState("");
  const [affiliateSearch, setAffiliateSearch] = useState("");

  const topBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return analytics.topBrands;
    return analytics.topBrands.filter(
      (row) =>
        row.businessName.toLowerCase().includes(q) ||
        row.slug?.toLowerCase().includes(q)
    );
  }, [analytics.topBrands, brandSearch]);

  const topAffiliates = useMemo(() => {
    const q = affiliateSearch.trim().toLowerCase();
    if (!q) return analytics.topAffiliates;
    return analytics.topAffiliates.filter(
      (row) =>
        row.firstName.toLowerCase().includes(q) ||
        row.lastName.toLowerCase().includes(q) ||
        row.country.toLowerCase().includes(q)
    );
  }, [analytics.topAffiliates, affiliateSearch]);

  const newestAffiliates = useMemo(() => {
    const q = affiliateSearch.trim().toLowerCase();
    if (!q) return analytics.newestAffiliates;
    return analytics.newestAffiliates.filter(
      (row) =>
        row.firstName.toLowerCase().includes(q) ||
        row.lastName.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.country.toLowerCase().includes(q)
    );
  }, [analytics.newestAffiliates, affiliateSearch]);

  const newestPrograms = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return analytics.newestPrograms;
    return analytics.newestPrograms.filter(
      (row) =>
        row.businessName.toLowerCase().includes(q) ||
        row.slug?.toLowerCase().includes(q)
    );
  }, [analytics.newestPrograms, brandSearch]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Affiliate Analytics</h1>
        <p className="mt-2 text-sm text-muted">
          Platform-wide affiliate activity, top performers, and program growth.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Participating Brands", value: analytics.participatingBrands },
          { label: "Total Affiliates", value: analytics.totalAffiliates },
          { label: "Referral Links", value: analytics.referralLinks },
          { label: "Total Platform Clicks", value: analytics.totalClicks },
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

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-[#0f172a]">Top Performing Brands</h2>
            <input
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full rounded-md border border-border px-4 py-2.5 text-sm sm:max-w-xs"
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2">Brand</th>
                  <th className="px-3 py-2">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {topBrands.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-3 py-3 font-medium text-[#0f172a]">
                      {row.slug ? (
                        <Link href={`/brands/${row.slug}`} className="hover:text-primary">
                          {row.businessName}
                        </Link>
                      ) : (
                        row.businessName
                      )}
                    </td>
                    <td className="px-3 py-3 text-muted">{row.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {topBrands.length === 0 ? (
              <p className="py-6 text-sm text-muted">No brand activity yet.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-[#0f172a]">Top Performing Affiliates</h2>
            <input
              value={affiliateSearch}
              onChange={(e) => setAffiliateSearch(e.target.value)}
              placeholder="Search affiliates..."
              className="w-full rounded-md border border-border px-4 py-2.5 text-sm sm:max-w-xs"
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2">Affiliate</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {topAffiliates.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-3 py-3 font-medium text-[#0f172a]">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="px-3 py-3 text-muted">{row.country}</td>
                    <td className="px-3 py-3 text-muted">{row.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {topAffiliates.length === 0 ? (
              <p className="py-6 text-sm text-muted">No affiliate activity yet.</p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0f172a]">Newest Affiliates</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2">Affiliate</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {newestAffiliates.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-3 py-3">
                      <p className="font-medium text-[#0f172a]">
                        {row.firstName} {row.lastName}
                      </p>
                      <p className="text-xs text-muted">{row.email}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">{row.country}</td>
                    <td className="px-3 py-3 text-muted">
                      {new Date(row.createdAt).toLocaleDateString("en-NZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {newestAffiliates.length === 0 ? (
              <p className="py-6 text-sm text-muted">No affiliates registered yet.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0f172a]">Newest Affiliate Programs</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2">Brand</th>
                  <th className="px-3 py-2">Commission</th>
                  <th className="px-3 py-2">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {newestPrograms.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-3 py-3 font-medium text-[#0f172a]">
                      {row.slug ? (
                        <Link href={`/brands/${row.slug}`} className="hover:text-primary">
                          {row.businessName}
                        </Link>
                      ) : (
                        row.businessName
                      )}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {row.commissionPercent != null ? `${row.commissionPercent}%` : "—"}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString("en-NZ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {newestPrograms.length === 0 ? (
              <p className="py-6 text-sm text-muted">No affiliate programs enabled yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
