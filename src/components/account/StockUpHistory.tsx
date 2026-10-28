"use client";

import Link from "next/link";
import type { MemberOrderHistoryItem } from "@/lib/commerce/member-orders";
import { formatOrderPlacedAt } from "@/lib/commerce/order-display";
import { formatNzPrice } from "@/lib/partner-offer";

export function StockUpHistory({ orders }: { orders: MemberOrderHistoryItem[] }) {
  return (
    <div className="min-h-screen bg-[#ecfdf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">My History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders you have placed with StockUp, with an invoice for each one.
        </p>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-vm-primary/30 bg-white px-5 py-12 text-center">
            <p className="font-semibold text-foreground">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When you check out, the order and invoice will show up here.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white"
            >
              Shop StockUp
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-lg border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg font-bold text-foreground">#{order.shortId}</p>
                    <p className="text-sm text-muted-foreground">
                      Placed {formatOrderPlacedAt(order.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-vm-primary/10 px-2.5 py-1 text-xs font-bold text-vm-primary">
                    {order.displayStatus}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {order.lines.map((line) => (
                    <li key={`${order.id}-${line.name}`}>
                      {line.quantity} × {line.name}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-sm text-muted-foreground">Total paid</p>
                  <p className="text-base font-bold text-foreground">{formatNzPrice(order.total)}</p>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/account/history/${order.id}`}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-sm bg-vm-primary text-sm font-semibold text-white"
                  >
                    View invoice
                  </Link>
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-sm border border-vm-primary text-sm font-semibold text-vm-primary"
                    >
                      Track order
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
