"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/admin/AdminUi";
import type { VendorRecord } from "@/lib/admin/wms-shared";

export function VendorsListClient({ vendors }: { vendors: VendorRecord[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
          <p className="mt-1 text-sm text-muted">Supplier records, payment terms, and purchase-order matrices.</p>
        </div>
        <Link
          href="/admin/vendors/new"
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          New vendor
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Vendor</th>
              <th className="px-4 py-3 font-semibold">Payment terms</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3 font-semibold">Open POs</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted">
                  No vendors yet. Add a supplier to start procurement.
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{vendor.name}</p>
                    <p className="text-xs text-muted">{vendor.contactName || vendor.email || "No contact"}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{vendor.paymentTerms || "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{vendor.productCount}</td>
                  <td className="px-4 py-3">
                    {vendor.openPoCount > 0 ? <StatusBadge label="OPEN" /> : <span className="text-muted">0</span>}
                    {vendor.openPoCount > 0 ? (
                      <span className="ml-2 tabular-nums text-muted">{vendor.openPoCount}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/vendors/${vendor.id}`} className="text-sm font-semibold text-primary">
                      Order grid
                    </Link>
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
