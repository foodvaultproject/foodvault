"use client";

import type { PartnerAffiliateOrderRow } from "@/lib/store-integration/types";
import { formatCurrency } from "@/lib/affiliate/format";
import { CommissionStatusBadge } from "@/components/store-integration/CommissionStatusBadge";
import {
  portalHelper,
  portalInput,
  portalSectionTitle,
  portalSelect,
  portalTableWrap,
} from "@/lib/partner-portal-classes";

type PartnerAffiliateOrdersTableProps = {
  rows: PartnerAffiliateOrderRow[];
  search: string;
  status: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export function PartnerAffiliateOrdersTable({
  rows,
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: PartnerAffiliateOrdersTableProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className={portalSectionTitle}>Affiliate Orders</h2>
        <p className={`${portalHelper} mt-1`}>
          Affiliate-attributed sales only — FoodVault does not track every Shopify order.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search affiliate or order number"
          className={`${portalInput} lg:max-w-md`}
        />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className={portalSelect}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className={portalSelect}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className={portalTableWrap}>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Affiliate</th>
              <th className="px-4 py-3">Order Number</th>
              <th className="px-4 py-3">Sale Value</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.orderId} className="border-b border-border/70">
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(row.orderDate).toLocaleDateString("en-NZ")}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{row.affiliateName}</td>
                <td className="px-4 py-3 text-foreground">{row.orderNumber}</td>
                <td className="px-4 py-3 text-foreground">
                  {formatCurrency(row.grossTotal, row.currency)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {row.commissionValue != null
                    ? formatCurrency(row.commissionValue, row.currency)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <CommissionStatusBadge status={row.commissionStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">
            No affiliate orders yet. Connect your store and share your program to start tracking
            sales.
          </p>
        ) : null}
      </div>
    </div>
  );
}
