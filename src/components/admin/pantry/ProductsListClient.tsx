"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/admin/AdminUi";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultProduct } from "@/types/commerce";

export function ProductsListClient({ products }: { products: FoodVaultProduct[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vault Market products</h1>
          <p className="mt-1 text-sm text-muted">
            Upload and edit Woolworths-style PDP attributes for foodvault_products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          New product
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">SOH</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted">
                  No products yet. Create the first Vault Market SKU.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{product.sku}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted">{product.brand}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {product.category}
                    {product.subcategory ? ` / ${product.subcategory}` : ""}
                    {product.specific ? ` / ${product.specific}` : ""}
                  </td>
                  <td className="px-4 py-3">{formatNzPrice(product.member_price)}</td>
                  <td className="px-4 py-3 tabular-nums">{product.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={product.is_active ? "Live" : "DRAFT"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      Edit
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
