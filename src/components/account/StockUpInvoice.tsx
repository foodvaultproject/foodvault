"use client";

import Link from "next/link";
import type { MemberOrderHistoryItem } from "@/lib/commerce/member-orders";
import { formatOrderPlacedAt } from "@/lib/commerce/order-display";
import { formatNzPrice } from "@/lib/partner-offer";

export function StockUpInvoice({ order }: { order: MemberOrderHistoryItem }) {
  return (
    <div className="min-h-screen bg-[#ecfdf5] print:bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 print:max-w-none print:px-0 print:py-0">
        <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
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

        <article className="rounded-lg border border-border bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-vm-primary">StockUp</p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">Invoice</h1>
              <p className="mt-1 font-mono text-sm text-muted-foreground">#{order.shortId}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{formatOrderPlacedAt(order.createdAt)}</p>
              <p className="mt-1 font-semibold text-foreground">{order.displayStatus}</p>
            </div>
          </div>

          {order.shippingName || order.shippingAddress ? (
            <div className="mt-6 text-sm">
              <p className="font-semibold text-foreground">Deliver to</p>
              {order.shippingName ? <p className="text-muted-foreground">{order.shippingName}</p> : null}
              {order.shippingAddress ? (
                <p className="text-muted-foreground">{order.shippingAddress}</p>
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

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatNzPrice(order.subtotal)}</span>
            </div>
            {order.totalSavings > 0 ? (
              <div className="flex justify-between text-vm-primary">
                <span>Savings</span>
                <span>{formatNzPrice(order.totalSavings)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold text-foreground">
              <span>Total paid</span>
              <span>{formatNzPrice(order.total)}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
