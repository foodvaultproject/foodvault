"use client";

import Link from "next/link";
import type { MemberOrderHistoryItem } from "@/lib/commerce/member-orders";
import { formatOrderPlacedAt } from "@/lib/commerce/order-display";
import { formatNzPrice } from "@/lib/partner-offer";

function gstIncluded(total: number) {
  return Math.round(((total * 3) / 23) * 100) / 100;
}

function invoiceTotalLabel(status: string) {
  if (status === "authorized" || status === "capturing" || status === "confirmed") {
    return "Total Authorized (Hold)";
  }
  if (status === "cancelled" || status === "refunded") {
    return "Order total";
  }
  return "Total Charged";
}

export function StockUpInvoice({ order }: { order: MemberOrderHistoryItem }) {
  const gst = gstIncluded(order.total);
  const totalLabel = invoiceTotalLabel(order.status);

  return (
    <div className="min-h-screen bg-[#ecfdf5] print:m-0 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 print:m-0 print:w-full print:max-w-none print:p-0">
        <div className="no-print mb-4 flex items-center justify-between gap-3 print:hidden">
          <Link href="/account/history" className="text-sm font-semibold text-vm-primary">
            Back to My History
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center justify-center rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white"
          >
            Print invoice
          </button>
        </div>

        <style>{`
          @page { size: A4; margin: 12mm; }
          @media print {
            html, body { background: #fff !important; }
            .no-print { display: none !important; }
          }
        `}</style>
        <article className="rounded-lg border border-border bg-white p-6 text-foreground shadow-none sm:p-8 print:break-inside-avoid print:w-full print:max-w-none print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-vm-primary print:text-black">
                StockUp
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground print:text-black">
                Britomart Groceries Limited t/a StockUp
                <br />
                17 Galway Street, Auckland Central, Auckland, 1010, NZ
                <br />
                GST No: 140-493-740
              </p>
              <h1 className="mt-4 text-2xl font-bold text-foreground print:text-black">
                Tax Invoice
              </h1>
              <p className="mt-1 font-mono text-sm text-muted-foreground print:text-neutral-800">
                #{order.shortId}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground print:text-neutral-800">
              <p>{formatOrderPlacedAt(order.createdAt)}</p>
              <p className="mt-1 font-semibold text-foreground print:text-black">{order.displayStatus}</p>
            </div>
          </div>

          {order.shippingName ||
          order.shippingEmail ||
          order.shippingPhone ||
          order.shippingAddress ? (
            <div className="mt-6 text-sm">
              <p className="font-semibold text-foreground print:text-black">Deliver to</p>
              {order.shippingName ? (
                <p className="text-muted-foreground print:text-neutral-800">{order.shippingName}</p>
              ) : null}
              {order.shippingEmail ? (
                <p className="text-muted-foreground print:text-neutral-800">{order.shippingEmail}</p>
              ) : null}
              {order.shippingPhone ? (
                <p className="text-muted-foreground print:text-neutral-800">{order.shippingPhone}</p>
              ) : null}
              {order.shippingAddress ? (
                <p className="text-muted-foreground print:text-neutral-800">{order.shippingAddress}</p>
              ) : null}
            </div>
          ) : null}

          <table className="mt-6 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 font-semibold">Item</th>
                <th className="py-2 text-right font-semibold">Qty</th>
                <th className="py-2 text-right font-semibold">Price</th>
                <th className="py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => (
                <tr key={`${line.name}-${line.unitPrice}`} className="border-b border-border">
                  <td className="py-3 text-foreground">{line.name}</td>
                  <td className="py-3 text-right">{line.quantity}</td>
                  <td className="py-3 text-right">{formatNzPrice(line.unitPrice)}</td>
                  <td className="py-3 text-right">{formatNzPrice(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1 text-sm print:text-black">
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-neutral-800">Subtotal</span>
              <span>{formatNzPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-neutral-800">Freight / Shipping</span>
              <span>{order.shippingCost === 0 ? "FREE" : formatNzPrice(order.shippingCost)}</span>
            </div>
            {order.totalSavings > 0 ? (
              <div className="flex justify-between text-vm-primary print:text-black">
                <span>Savings</span>
                <span>{formatNzPrice(order.totalSavings)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold text-foreground print:text-black">
              <span>{totalLabel}</span>
              <span>{formatNzPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-foreground print:text-black">
              <span>Includes GST (15%)</span>
              <span>{formatNzPrice(gst)}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
