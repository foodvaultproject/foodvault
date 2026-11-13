"use client";

import { useEffect } from "react";
import { formatNzPrice } from "@/lib/partner-offer";
import type { PackingSlipOrder } from "@/lib/admin/packing-slip";

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function gstIncluded(total: number) {
  return Math.round(((total * 3) / 23) * 100) / 100;
}

export function PackingSlipView({
  order,
  autoprint = false,
}: {
  order: PackingSlipOrder;
  autoprint?: boolean;
}) {
  useEffect(() => {
    if (!autoprint) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [autoprint]);

  const gst = gstIncluded(order.total);

  return (
    <div className="packing-slip min-h-screen bg-white text-black">
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          html, body { background: #fff !important; color: #000 !important; }
          .packing-slip { padding: 0 !important; }
        }
      `}</style>

      <div className="print:hidden mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm font-semibold text-neutral-600">Tax invoice / packing slip</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white"
        >
          Print
        </button>
      </div>

      <article className="mx-auto max-w-3xl px-4 pb-10 pt-2 print:max-w-none print:px-0 print:pb-0 print:pt-0">
        <header className="flex items-start justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <img src="/Favicon/favicon_stockup.png" alt="StockUp" className="h-10 w-auto print:h-8" />
            <p className="mt-2 text-xs font-bold uppercase tracking-widest">StockUp</p>
            <p className="mt-2 text-sm leading-relaxed">
              Britomart Groceries Limited t/a StockUp
              <br />
              17 Galway Street, Auckland Central, Auckland, 1010, NZ
              <br />
              GST No: 140-493-740
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide">Tax Invoice / Packing Slip</p>
            <p className="font-mono text-2xl font-black">#{order.shortId}</p>
            <p className="mt-1 text-sm">{formatOrderDate(order.createdAt)}</p>
            {order.trackingNumber ? (
              <p className="mt-1 text-sm font-semibold">NZ Post tracking: {order.trackingNumber}</p>
            ) : null}
          </div>
        </header>

        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide">Deliver to</p>
            <p className="mt-1 text-base font-bold">{order.customerName}</p>
            {order.customerEmail ? <p className="text-sm">{order.customerEmail}</p> : null}
            {order.customerPhone ? <p className="text-sm">{order.customerPhone}</p> : null}
            {order.addressLines.length > 0 ? (
              order.addressLines.map((line) => (
                <p key={line} className="text-sm leading-snug">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm">No shipping address on file.</p>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide">Order</p>
            <p className="mt-1 font-mono text-sm">{order.id}</p>
            <p className="mt-1 text-sm">
              {order.lines.length} line{order.lines.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        <table className="mt-5 w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-y-2 border-black">
              <th className="py-2 pr-2 font-bold">SKU</th>
              <th className="py-2 pr-2 font-bold">Product</th>
              <th className="py-2 pr-2 text-center font-bold">Qty ordered</th>
              <th className="py-2 pr-2 text-center font-bold">Qty picked</th>
              <th className="py-2 pr-2 font-bold">Bin</th>
              <th className="py-2 pr-2 text-right font-bold">Unit price</th>
              <th className="py-2 text-right font-bold">Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line, index) => (
              <tr key={`${line.sku}-${index}`} className="border-b border-neutral-300">
                <td className="py-2 pr-2 align-top font-mono">{line.sku}</td>
                <td className="py-2 pr-2 align-top font-semibold">{line.name}</td>
                <td className="py-2 pr-2 align-top text-center">{line.ordered}</td>
                <td className="py-2 pr-2 align-top text-center text-base font-black">{line.picked}</td>
                <td className="py-2 pr-2 align-top font-semibold">{line.binLocation}</td>
                <td className="py-2 pr-2 align-top text-right">{formatNzPrice(line.unitPrice)}</td>
                <td className="py-2 align-top text-right font-bold">{formatNzPrice(line.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-5 ml-auto w-full max-w-xs border-2 border-black p-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal (picked items)</span>
            <span>{formatNzPrice(order.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span>Freight / Shipping</span>
            <span>{order.shippingCost === 0 ? "FREE" : formatNzPrice(order.shippingCost)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-black pt-2 text-base font-black">
            <span>Total Charged</span>
            <span>{formatNzPrice(order.total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span>Includes GST (15%)</span>
            <span>{formatNzPrice(gst)}</span>
          </div>
          {order.totalSavings > 0 ? (
            <div className="mt-2 bg-black px-2 py-1.5 text-sm font-bold text-white">
              <div className="flex justify-between">
                <span>Saver savings</span>
                <span>{formatNzPrice(order.totalSavings)}</span>
              </div>
            </div>
          ) : null}
        </section>

        <p className="mt-8 text-center text-[11px] uppercase tracking-wide">
          Thank you for shopping StockUp · stockup.co.nz
        </p>
      </article>
    </div>
  );
}
