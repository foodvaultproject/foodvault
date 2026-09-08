"use client";

import { StatCard, StatusBadge } from "@/components/admin/AdminUi";
import { formatDos, type InventoryReportData } from "@/lib/admin/market-reports-shared";
import { formatNzPrice } from "@/lib/partner-offer";

export function InventoryReportsClient({ data }: { data: InventoryReportData }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory health</h1>
        <p className="mt-1 text-sm text-muted">
          ABC segmentation, days of supply, and lost sales from out-of-stock views and searches.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Class A SKUs" value={data.abcRows.filter((row) => row.abcClass === "A").length} />
        <StatCard label="Dead / slow movers" value={data.deadStock.length} hint="Class C with > 60 days of supply" />
        <StatCard
          label="Lost sales (30d)"
          value={formatNzPrice(data.lostSalesTotal)}
          hint={`${data.lostSales.length} out-of-stock SKUs demanded`}
        />
      </div>

      <section className="overflow-x-auto rounded border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">ABC inventory segmentation</h2>
        </div>
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Class</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">SOH</th>
              <th className="px-4 py-3 font-semibold">30-day velocity</th>
              <th className="px-4 py-3 font-semibold">DOS</th>
              <th className="px-4 py-3 font-semibold">Reorder</th>
            </tr>
          </thead>
          <tbody>
            {data.abcRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted">
                  No catalog products to classify.
                </td>
              </tr>
            ) : (
              data.abcRows.map((row) => (
                <tr key={row.productId} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <StatusBadge label={`Class ${row.abcClass}`} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3 font-semibold">{row.name}</td>
                  <td className="px-4 py-3 tabular-nums">{row.soh}</td>
                  <td className="px-4 py-3 tabular-nums">{row.velocity30d}</td>
                  <td className="px-4 py-3 tabular-nums">{formatDos(row.daysOfSupply)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={row.reorderStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Dead stock & slow movers</h2>
        </div>
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">SOH</th>
              <th className="px-4 py-3 font-semibold">30-day velocity</th>
              <th className="px-4 py-3 font-semibold">DOS</th>
            </tr>
          </thead>
          <tbody>
            {data.deadStock.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted">
                  No Class C items with more than 60 days of supply.
                </td>
              </tr>
            ) : (
              data.deadStock.map((row) => (
                <tr key={row.productId} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3 font-semibold">{row.name}</td>
                  <td className="px-4 py-3 tabular-nums">{row.soh}</td>
                  <td className="px-4 py-3 tabular-nums">{row.velocity30d}</td>
                  <td className="px-4 py-3 tabular-nums">{formatDos(row.daysOfSupply)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Lost sales log</h2>
          <p className="mt-1 text-xs text-muted">
            Members who viewed or searched a product while it was out of stock.
          </p>
        </div>
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Views</th>
              <th className="px-4 py-3 font-semibold">Searches</th>
              <th className="px-4 py-3 font-semibold">Missed revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.lostSales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted">
                  No out-of-stock demand recorded in the last 30 days.
                </td>
              </tr>
            ) : (
              data.lostSales.map((row) => (
                <tr key={row.productId} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                  <td className="px-4 py-3 font-semibold">{row.name}</td>
                  <td className="px-4 py-3 tabular-nums">{row.views}</td>
                  <td className="px-4 py-3 tabular-nums">{row.searches}</td>
                  <td className="px-4 py-3">{formatNzPrice(row.estimatedRevenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
