"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatNzPrice } from "@/lib/partner-offer";
import { assignVendorProductsAction, generatePurchaseOrderAction } from "@/lib/admin/wms-actions";
import type { VendorProductRow, VendorRecord } from "@/lib/admin/wms-shared";
import { VendorForm } from "@/components/admin/wms/VendorForm";

export function VendorDetailClient({
  vendor,
  products,
  assignable,
}: {
  vendor: VendorRecord;
  products: VendorProductRow[];
  assignable: Array<{ id: string; sku: string; name: string }>;
}) {
  const router = useRouter();
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedCount = useMemo(
    () => Object.values(qtys).filter((qty) => qty > 0).length,
    [qtys]
  );

  function generatePo() {
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("vendor_id", vendor.id);
    for (const [productId, qty] of Object.entries(qtys)) {
      if (qty > 0) formData.set(`qty_${productId}`, String(qty));
    }
    startTransition(async () => {
      const result = await generatePurchaseOrderAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setQtys({});
      setMessage(`Created ${result.poNumber}.`);
      router.push(`/admin/purchase-orders/${result.id}`);
      router.refresh();
    });
  }

  function assignProducts(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await assignVendorProductsAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <VendorForm vendor={vendor} />

      {assignable.length > 0 ? (
        <form action={assignProducts} className="rounded border border-border bg-white p-5">
          <input type="hidden" name="vendor_id" value={vendor.id} />
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Add products to this vendor</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {assignable.map((product) => (
              <label key={product.id} className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" name="product_ids" value={product.id} />
                <span>{product.name} <span className="text-muted">({product.sku})</span></span>
              </label>
            ))}
          </div>
          <button type="submit" disabled={pending} className="mt-4 rounded-sm border border-border px-4 py-2 text-sm font-semibold">
            Assign selected
          </button>
        </form>
      ) : null}

      <div className="rounded border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Product ordering matrix</h2>
            <p className="text-sm text-muted">{selectedCount} SKU{selectedCount === 1 ? "" : "s"} ready to order</p>
          </div>
          <button
            type="button"
            disabled={pending || selectedCount === 0}
            onClick={generatePo}
            className="fv-btn-primary rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {pending ? "Creating…" : "Generate Purchase Order"}
          </button>
        </div>
        {error ? <p className="px-4 pt-3 text-sm font-medium text-red-600">{error}</p> : null}
        {message ? <p className="px-4 pt-3 text-sm font-medium text-emerald-700">{message}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Product name</th>
                <th className="px-4 py-3 font-semibold">Barcode</th>
                <th className="px-4 py-3 font-semibold">Wholesale cost</th>
                <th className="px-4 py-3 font-semibold">Current SOH</th>
                <th className="px-4 py-3 font-semibold">30-day sales</th>
                <th className="px-4 py-3 font-semibold">Order qty</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted">
                    Assign products to this vendor to build a purchase order.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{product.barcode || "—"}</td>
                    <td className="px-4 py-3">{formatNzPrice(product.wholesaleCost)}</td>
                    <td className="px-4 py-3 tabular-nums">{product.stockQuantity}</td>
                    <td className="px-4 py-3 tabular-nums">{product.salesVelocity30d}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={qtys[product.id] ?? 0}
                        onChange={(event) =>
                          setQtys((current) => ({
                            ...current,
                            [product.id]: Math.max(0, Math.trunc(Number(event.target.value) || 0)),
                          }))
                        }
                        className="w-24 rounded-md border border-border px-2 py-2 text-sm"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
