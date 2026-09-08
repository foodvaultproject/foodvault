"use client";

import { StatCard } from "@/components/admin/AdminUi";
import { DateRangeFilter } from "@/components/admin/reports/DateRangeFilter";
import { formatGmroi, type SalesReportData } from "@/lib/admin/market-reports-shared";
import { formatNzPrice } from "@/lib/partner-offer";

export function SalesReportsClient({ data }: { data: SalesReportData }) {
  const { summary } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales & profitability</h1>
        <p className="mt-1 text-sm text-muted">
          Vault Market revenue, margin, member savings, and category GMROI.
        </p>
      </div>

      <DateRangeFilter range={data.range} basePath="/admin/reports/sales" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total revenue" value={formatNzPrice(summary.revenue)} hint={`${summary.orderCount} paid orders`} />
        <StatCard label="Gross margin $" value={formatNzPrice(summary.grossMargin)} />
        <StatCard
          label="Gross margin %"
          value={`${summary.grossMarginPct.toFixed(1)}%`}
          hint={`COGS ${formatNzPrice(summary.cogs)}`}
        />
        <StatCard label="Member savings given" value={formatNzPrice(summary.memberSavings)} />
        <StatCard label="Average order value" value={formatNzPrice(summary.aov)} />
        <StatCard
          label="Average basket size"
          value={summary.basketSize.toFixed(1)}
          hint="Items per order"
        />
      </div>

      <section className="overflow-x-auto rounded border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Category profitability</h2>
        </div>
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Subcategory</th>
              <th className="px-4 py-3 font-semibold">Revenue</th>
              <th className="px-4 py-3 font-semibold">COGS</th>
              <th className="px-4 py-3 font-semibold">Gross profit</th>
              <th className="px-4 py-3 font-semibold">GMROI</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                  No Vault Market sales in this date range.
                </td>
              </tr>
            ) : (
              data.categories.map((row) => (
                <tr key={`${row.category}-${row.subcategory}`} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 font-semibold">{row.category}</td>
                  <td className="px-4 py-3 text-muted">{row.subcategory}</td>
                  <td className="px-4 py-3">{formatNzPrice(row.revenue)}</td>
                  <td className="px-4 py-3">{formatNzPrice(row.cogs)}</td>
                  <td className="px-4 py-3">{formatNzPrice(row.grossProfit)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatGmroi(row.gmroi)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
