"use client";

import { useMemo } from "react";
import type { PartnerAffiliateDirectoryRow } from "@/lib/partner-affiliate/analytics";
import { formatCurrency } from "@/lib/affiliate/format";
import {
  portalCard,
  portalCardTitle,
  portalHelper,
  portalInput,
  portalSectionTitle,
  portalSelect,
  portalTableWrap,
} from "@/lib/partner-portal-classes";

type PartnerAffiliateDirectoryProps = {
  rows: PartnerAffiliateDirectoryRow[];
  countries: string[];
  onSelect: (affiliateId: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onCountryChange: (country: string) => void;
  search: string;
  sort: string;
  country: string;
};

export function PartnerAffiliateDirectory({
  rows,
  countries,
  onSelect,
  onSearchChange,
  onSortChange,
  onCountryChange,
  search,
  sort,
  country,
}: PartnerAffiliateDirectoryProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className={portalSectionTitle}>Affiliates</h2>
        <p className={`${portalHelper} mt-1`}>
          Everyone eligible to promote your brand. FoodVault manages approval automatically — no
          action required from you.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search affiliate"
          className={`${portalInput} lg:max-w-md`}
        />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className={portalSelect}
        >
          <option value="newest">Newest</option>
          <option value="clicks">Most Clicks</option>
          <option value="alpha">A–Z</option>
        </select>
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className={portalSelect}
        >
          <option value="">All countries</option>
          {countries.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className={`hidden lg:block ${portalTableWrap}`}>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Affiliate Name</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Date Joined</th>
              <th className="px-4 py-3">Referral Link</th>
              <th className="px-4 py-3">Total Clicks</th>
              <th className="px-4 py-3">Estimated Sales</th>
              <th className="px-4 py-3">Estimated Commission</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.affiliateId}
                className="cursor-pointer border-b border-border/70 hover:bg-primary/5"
                onClick={() => onSelect(row.affiliateId)}
              >
                <td className="px-4 py-3 font-medium text-foreground">{row.fullName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.country}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(row.joinedAt).toLocaleDateString("en-NZ")}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                  {row.referralUrl}
                </td>
                <td className="px-4 py-3 text-foreground">{row.totalClicks}</td>
                <td className="px-4 py-3 text-foreground">
                  {formatCurrency(row.estimatedSales)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatCurrency(row.estimatedCommission)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-success-light px-2.5 py-1 text-xs font-semibold text-success">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">No affiliates found.</p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:hidden">
        {rows.map((row) => (
          <button
            key={row.affiliateId}
            type="button"
            onClick={() => onSelect(row.affiliateId)}
            className={`${portalCard} text-left transition-colors hover:border-primary/30`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={portalCardTitle}>{row.fullName}</p>
                <p className={`${portalHelper} mt-0.5`}>{row.country}</p>
              </div>
              <span className="rounded-full bg-success-light px-2.5 py-1 text-xs font-semibold text-success">
                Active
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Joined {new Date(row.joinedAt).toLocaleDateString("en-NZ")}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {row.totalClicks} clicks · {formatCurrency(row.estimatedSales)} sales
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PartnerAffiliateDirectoryTopList({
  rows,
  onSelect,
}: {
  rows: PartnerAffiliateDirectoryRow[];
  onSelect: (affiliateId: string) => void;
}) {
  const top = useMemo(
    () => [...rows].sort((a, b) => b.estimatedSales - a.estimatedSales).slice(0, 3),
    [rows]
  );

  if (top.length === 0) {
    return <p className="text-sm text-muted-foreground">No affiliate activity yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {top.map((row, index) => (
        <li key={row.affiliateId}>
          <button
            type="button"
            onClick={() => onSelect(row.affiliateId)}
            className="flex w-full items-center justify-between rounded-sm border border-border px-4 py-3 text-left hover:bg-primary/5"
          >
            <span className="text-sm font-medium text-foreground">
              {index + 1}. {row.fullName}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(row.estimatedSales)} · {row.totalClicks} clicks
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export function PartnerAffiliateRecentClicksList({
  rows,
}: {
  rows: PartnerAffiliateDirectoryRow[];
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No clicks recorded yet.</p>;
  }

  return (
    <ul className="space-y-3 text-sm text-muted-foreground">
      {rows.slice(0, 3).map((row) => (
        <li key={row.affiliateId}>
          {row.fullName} · {row.totalClicks} total clicks
        </li>
      ))}
    </ul>
  );
}
