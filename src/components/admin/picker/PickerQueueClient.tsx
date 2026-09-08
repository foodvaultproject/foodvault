"use client";

import Link from "next/link";
import { formatNzPrice } from "@/lib/partner-offer";
import { PickerElapsed } from "@/components/admin/picker/PickerElapsed";
import type { PickerQueueCard, PickerQueueTab } from "@/lib/admin/picker-shared";

export function PickerMobileTabs({ tab }: { tab: PickerQueueTab }) {
  const items: Array<{ href: string; id: PickerQueueTab; label: string }> = [
    { href: "/admin/picker", id: "pick", label: "To Pick" },
    { href: "/admin/picker?tab=fulfilled", id: "fulfilled", label: "Fulfilled" },
    { href: "/admin/picker/scan", id: "scan", label: "Scan Product Info" },
    { href: "/admin/picker/receive", id: "receive", label: "Receive" },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-border sm:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`rounded-xl px-3 py-3 text-center text-sm font-bold ${
            tab === item.id ? "bg-primary text-primary-foreground" : "text-muted"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function PickerQueueClient({
  tab,
  orders,
}: {
  tab: PickerQueueTab;
  orders: PickerQueueCard[];
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Active orders</h1>
        <p className="mt-1 text-sm text-muted">
          Walk the warehouse in one pass. Oldest paid orders sit at the top.
        </p>
      </div>

      <PickerMobileTabs tab={tab} />

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-12 text-center">
          <p className="text-base font-semibold text-foreground">
            {tab === "fulfilled" ? "No orders fulfilled today yet." : "No paid orders waiting to pick."}
          </p>
          <p className="mt-1 text-sm text-muted">
            {tab === "fulfilled"
              ? "Completed picks will land here after dispatch."
              : "New Vault Market checkouts appear here as soon as payment confirms."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Order</p>
                    <p className="font-mono text-xl font-bold text-foreground">#{order.shortId}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      order.status === "fulfilled"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {order.status === "fulfilled" ? "Fulfilled" : "Paid"}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-base font-bold text-foreground">{order.customerName}</p>
                  <p className="mt-0.5 text-sm leading-snug text-muted">{order.addressSummary}</p>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 px-2 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Items</dt>
                    <dd className="mt-1 text-lg font-bold text-foreground">{order.itemCount}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-2 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Value</dt>
                    <dd className="mt-1 text-lg font-bold text-foreground">{formatNzPrice(order.total)}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-2 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Wait</dt>
                    <dd className="mt-1 text-lg font-bold text-foreground">
                      <PickerElapsed paidAt={order.paidAt} />
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/admin/picker/${order.id}`}
                  className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground"
                >
                  {order.status === "fulfilled" ? "View order" : "Start Picking Order"}
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
