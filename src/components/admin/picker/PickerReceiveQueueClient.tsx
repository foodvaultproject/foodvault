"use client";

import Link from "next/link";
import type { PurchaseOrderRecord } from "@/lib/admin/wms-shared";

export function PickerReceiveQueueClient({ orders }: { orders: PurchaseOrderRecord[] }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-4">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Receive purchase orders</h1>
      <p className="mt-1 text-sm text-muted">Select an open PO and scan items as pallets arrive.</p>
      {orders.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-white px-5 py-12 text-center">
          <p className="font-semibold text-foreground">No open purchase orders.</p>
          <p className="mt-1 text-sm text-muted">Generate a PO from a vendor grid first.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <p className="font-mono text-xl font-bold">{order.poNumber}</p>
                <p className="mt-1 text-sm text-muted">{order.vendorName}</p>
                <p className="mt-3 text-sm font-semibold">
                  {order.receivedUnits}/{order.orderedUnits} units received
                </p>
                <Link
                  href={`/admin/picker/receive/${order.id}`}
                  className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground"
                >
                  Start receiving
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
