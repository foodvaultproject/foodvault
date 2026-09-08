"use client";

import Link from "next/link";
import { StatCard, StatusBadge, formatAdminDate } from "@/components/admin/AdminUi";
import { formatPct, type VendorReportData } from "@/lib/admin/market-reports-shared";
import { formatNzPrice } from "@/lib/partner-offer";

export function VendorReportsClient({ data }: { data: VendorReportData }) {
  const openClaims = data.creditClaims.filter((row) => row.status !== "settled");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shrinkage & supplier compliance</h1>
        <p className="mt-1 text-sm text-muted">
          Waste by reason, vendor OTIF from purchase orders, and open credit claims.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Shrinkage & waste" value={formatNzPrice(data.shrinkageTotal)} />
        <StatCard label="Vendors scored" value={data.vendors.length} />
        <StatCard label="Open credit claims" value={openClaims.length} />
      </div>

      <section className="overflow-x-auto rounded border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Shrinkage & waste</h2>
        </div>
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Units</th>
              <th className="px-4 py-3 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.shrinkage.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-sm text-muted">
                  No expired, damaged, or unaccounted stock recorded.
                </td>
              </tr>
            ) : (
              data.shrinkage.map((row) => (
                <tr key={row.reason} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 font-semibold">{row.reason}</td>
                  <td className="px-4 py-3 tabular-nums">{row.units}</td>
                  <td className="px-4 py-3">{formatNzPrice(row.value)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Vendor OTIF & quality</h2>
        </div>
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Vendor</th>
              <th className="px-4 py-3 font-semibold">Received POs</th>
              <th className="px-4 py-3 font-semibold">Ordered</th>
              <th className="px-4 py-3 font-semibold">Received</th>
              <th className="px-4 py-3 font-semibold">Fulfillment</th>
              <th className="px-4 py-3 font-semibold">Quality issues</th>
            </tr>
          </thead>
          <tbody>
            {data.vendors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                  No vendors yet. Add suppliers to start OTIF scoring.
                </td>
              </tr>
            ) : (
              data.vendors.map((row) => (
                <tr key={row.vendorId} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/vendors/${row.vendorId}`} className="font-semibold text-primary">
                      {row.vendorName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.poCount}</td>
                  <td className="px-4 py-3 tabular-nums">{row.unitsOrdered}</td>
                  <td className="px-4 py-3 tabular-nums">{row.unitsReceived}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPct(row.fulfillmentPct)}</td>
                  <td className="px-4 py-3 tabular-nums">{row.qualityIssueUnits}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Open credit claims ledger</h2>
        </div>
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Credit</th>
              <th className="px-4 py-3 font-semibold">Vendor</th>
              <th className="px-4 py-3 font-semibold">PO</th>
              <th className="px-4 py-3 font-semibold">Claim</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {openClaims.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                  No draft or submitted credit notes. Settled claims are hidden from this ledger.
                </td>
              </tr>
            ) : (
              openClaims.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/credit-notes/${row.id}`} className="font-mono font-semibold text-primary">
                      {row.creditNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.vendorName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.poNumber || "—"}</td>
                  <td className="px-4 py-3">{formatNzPrice(row.totalClaim)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={row.statusLabel} />
                  </td>
                  <td className="px-4 py-3 text-muted">{row.createdAt ? formatAdminDate(row.createdAt) : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
