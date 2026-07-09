"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CommissionStatusBadge } from "@/components/store-integration/CommissionStatusBadge";
import { formatCurrency } from "@/lib/affiliate/format";
import type {
  AdminAffiliateTransactionRow,
  AdminAffiliateTransactionSummary,
} from "@/lib/store-integration/types";

type AdminAffiliateTransactionsClientProps = {
  summary: AdminAffiliateTransactionSummary;
  transactions: AdminAffiliateTransactionRow[];
};

export function AdminAffiliateTransactionsClient({
  summary: initialSummary,
  transactions: initialTransactions,
}: AdminAffiliateTransactionsClientProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const transactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialTransactions.filter((row) => {
      const matchesSearch =
        !q ||
        row.orderNumber.toLowerCase().includes(q) ||
        row.businessName.toLowerCase().includes(q) ||
        row.affiliateName.toLowerCase().includes(q) ||
        row.affiliateEmail.toLowerCase().includes(q);
      const matchesStatus = !status || row.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [initialTransactions, search, status]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Affiliate Transactions</h1>
        <p className="mt-2 text-sm text-muted">
          Platform-wide affiliate orders, commissions, and refund activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Platform Sales", value: formatCurrency(initialSummary.platformSales) },
          { label: "Pending Commission", value: formatCurrency(initialSummary.pendingCommission) },
          {
            label: "Approved Commission",
            value: formatCurrency(initialSummary.approvedCommission),
          },
          { label: "Paid Commission", value: formatCurrency(initialSummary.paidCommission) },
          {
            label: "Refunded Commission",
            value: formatCurrency(initialSummary.refundedCommission),
          },
          {
            label: "Cancelled Commission",
            value: formatCurrency(initialSummary.cancelledCommission),
          },
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-bold text-[#0f172a]">Transactions</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand, affiliate, order #..."
              className="rounded-lg border border-border px-4 py-2.5 text-sm"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-border px-4 py-2.5 text-sm"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Affiliate</th>
                <th className="px-3 py-2">Order #</th>
                <th className="px-3 py-2">Sale</th>
                <th className="px-3 py-2">Commission</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Store</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => (
                <tr key={row.id} className="border-b border-border/70">
                  <td className="px-3 py-3 text-muted">
                    {new Date(row.orderDate).toLocaleDateString("en-NZ")}
                  </td>
                  <td className="px-3 py-3 font-medium text-[#0f172a]">
                    {row.brandSlug ? (
                      <Link href={`/brands/${row.brandSlug}`} className="hover:text-primary">
                        {row.businessName}
                      </Link>
                    ) : (
                      row.businessName
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-[#0f172a]">{row.affiliateName}</p>
                    <p className="text-xs text-muted">{row.affiliateEmail}</p>
                  </td>
                  <td className="px-3 py-3 text-muted">{row.orderNumber}</td>
                  <td className="px-3 py-3 text-[#0f172a]">
                    {formatCurrency(row.grossSale, row.currency)}
                  </td>
                  <td className="px-3 py-3 text-[#0f172a]">
                    {formatCurrency(row.commissionValue, row.currency)}
                    {row.reviewRequired ? (
                      <span className="ml-2 text-xs font-semibold text-amber-700">
                        Review required
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <CommissionStatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-3 capitalize text-muted">{row.platform ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 ? (
            <p className="py-6 text-sm text-muted">No transactions found.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
