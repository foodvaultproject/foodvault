"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/admin/AdminUi";
import type { PantryReportData } from "@/lib/admin/pantry-shared";
import { formatNzPrice } from "@/lib/partner-offer";

const WINDOWS = [30, 60, 90] as const;

export function PantryReportsClient({ data }: { data: PantryReportData }) {
  const [windowDays, setWindowDays] = useState<(typeof WINDOWS)[number]>(30);
  const expiry = useMemo(
    () => data.expiry.filter((row) => row.days_until_expiry <= windowDays),
    [data.expiry, windowDays]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory & sales reports</h1>
        <p className="mt-1 text-sm text-muted">
          Stock on hand valuation, slow movers, and batches approaching expiry.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Stock on hand</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Units on hand" value={data.sohTotals.units.toLocaleString()} />
          <StatCard label="Wholesale valuation" value={formatNzPrice(data.sohTotals.wholesale)} />
          <StatCard label="Member retail value" value={formatNzPrice(data.sohTotals.retail)} />
        </div>
        <div className="overflow-x-auto rounded border border-border bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Total SOH</th>
                <th className="px-4 py-3 font-semibold">Unit cost</th>
                <th className="px-4 py-3 font-semibold">Wholesale value</th>
                <th className="px-4 py-3 font-semibold">Retail value</th>
              </tr>
            </thead>
            <tbody>
              {data.soh.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                    No catalog products to value.
                  </td>
                </tr>
              ) : (
                data.soh.map((row) => (
                  <tr key={row.product_id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.sku}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 tabular-nums">{row.soh}</td>
                    <td className="px-4 py-3">{formatNzPrice(row.unit_cost_price)}</td>
                    <td className="px-4 py-3">{formatNzPrice(row.wholesale_value)}</td>
                    <td className="px-4 py-3">{formatNzPrice(row.retail_value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Slow-moving stock
          </h2>
          <p className="mt-1 text-sm text-muted">
            SOH greater than 20 units and fewer than 5 units sold in the last 30 days.
          </p>
        </div>
        <StatCard label="Slow-moving SKUs" value={data.slowMoving.length} />
        <div className="overflow-x-auto rounded border border-border bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">SOH</th>
                <th className="px-4 py-3 font-semibold">Sold (30d)</th>
              </tr>
            </thead>
            <tbody>
              {data.slowMoving.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                    No slow-moving items in the current window.
                  </td>
                </tr>
              ) : (
                data.slowMoving.map((row) => (
                  <tr key={row.product_id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.sku}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 tabular-nums">{row.stock_quantity}</td>
                    <td className="px-4 py-3 tabular-nums">{row.units_sold_30d}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Expiry warning tracker
            </h2>
            <p className="mt-1 text-sm text-muted">
              Batches that should be promoted or discounted before they expire.
            </p>
          </div>
          <div className="flex gap-1 rounded border border-border bg-page p-1">
            {WINDOWS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setWindowDays(days)}
                className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                  windowDays === days ? "bg-white text-primary shadow-sm" : "text-muted"
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
        <StatCard label={`Batches expiring in ${windowDays} days`} value={expiry.length} />
        <div className="overflow-x-auto rounded border border-border bg-white">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Expiry</th>
                <th className="px-4 py-3 font-semibold">Days left</th>
              </tr>
            </thead>
            <tbody>
              {expiry.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                    No batches expiring in this window.
                  </td>
                </tr>
              ) : (
                expiry.map((row) => (
                  <tr key={row.batch_id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.sku}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.batch_number}</td>
                    <td className="px-4 py-3 tabular-nums">{row.quantity_received}</td>
                    <td className="px-4 py-3">{row.expiry_date}</td>
                    <td className={`px-4 py-3 tabular-nums ${row.days_until_expiry <= 30 ? "font-bold text-red-700" : ""}`}>
                      {row.days_until_expiry}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
