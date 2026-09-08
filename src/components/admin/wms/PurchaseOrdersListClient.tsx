"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/admin/AdminUi";
import type { PurchaseOrderRecord } from "@/lib/admin/wms-shared";

function statusLabel(status: PurchaseOrderRecord["status"]) {
  if (status === "open") return "OPEN";
  if (status === "receiving") return "OPEN";
  if (status === "received") return "RESOLVED";
  return "CLOSED";
}

export function PurchaseOrdersListClient({ orders }: { orders: PurchaseOrderRecord[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Purchase orders</h1>
        <p className="mt-1 text-sm text-muted">Open POs can be received from the warehouse picker.</p>
      </div>
      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">PO</th>
              <th className="px-4 py-3 font-semibold">Vendor</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Lines</th>
              <th className="px-4 py-3 font-semibold">Received</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                  No purchase orders yet. Generate one from a vendor grid.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold">{order.poNumber}</td>
                  <td className="px-4 py-3">{order.vendorName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={statusLabel(order.status)} />
                    <span className="ml-2 text-xs capitalize text-muted">{order.status}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{order.itemCount}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {order.receivedUnits}/{order.orderedUnits}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/purchase-orders/${order.id}`} className="text-sm font-semibold text-primary">
                      View
                    </Link>
                    {order.status === "open" || order.status === "receiving" ? (
                      <Link
                        href={`/admin/picker/receive/${order.id}`}
                        className="ml-3 text-sm font-semibold text-primary"
                      >
                        Receive
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
