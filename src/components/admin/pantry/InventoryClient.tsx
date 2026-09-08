"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatAdminDate } from "@/components/admin/AdminUi";
import { saveInventoryBatchAction } from "@/lib/admin/pantry-actions";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultInventoryBatch, FoodVaultProduct } from "@/types/commerce";

type BatchRow = FoodVaultInventoryBatch & {
  product_name?: string;
  product_sku?: string;
};

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

export function InventoryClient({
  products,
  batches,
}: {
  products: FoodVaultProduct[];
  batches: BatchRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BatchRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setError(null);
    setOpen(true);
  }

  function openEdit(batch: BatchRow) {
    setEditing(batch);
    setError(null);
    setOpen(true);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveInventoryBatchAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Batch inventory</h1>
          <p className="mt-1 text-sm text-muted">
            Log stock arrivals, unit cost, and expiry. Product SOH updates automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Log stock intake
        </button>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Batch</th>
              <th className="px-4 py-3 font-semibold">Qty received</th>
              <th className="px-4 py-3 font-semibold">Unit cost</th>
              <th className="px-4 py-3 font-semibold">Expiry</th>
              <th className="px-4 py-3 font-semibold">Logged</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted">
                  No inventory batches yet.
                </td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr key={batch.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{batch.product_name ?? "Unknown"}</p>
                    <p className="text-xs text-muted">{batch.product_sku}</p>
                  </td>
                  <td className="px-4 py-3">{batch.batch_number}</td>
                  <td className="px-4 py-3 tabular-nums">{batch.quantity_received}</td>
                  <td className="px-4 py-3">{formatNzPrice(batch.unit_cost_price)}</td>
                  <td className="px-4 py-3">{batch.expiry_date ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {batch.created_at ? formatAdminDate(batch.created_at) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(batch)}
                      className="text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">
              {editing ? "Edit stock batch" : "Log stock intake"}
            </h2>
            <form action={handleSubmit} className="mt-4 space-y-4">
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <div>
                <label className={labelClass} htmlFor="product_id">Product</label>
                <select
                  id="product_id"
                  name="product_id"
                  required
                  defaultValue={editing?.product_id ?? ""}
                  className={inputClass}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} — {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="quantity_received">Quantity received</label>
                  <input
                    id="quantity_received"
                    name="quantity_received"
                    type="number"
                    min="1"
                    required
                    defaultValue={editing?.quantity_received ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="unit_cost_price">Unit cost price</label>
                  <input
                    id="unit_cost_price"
                    name="unit_cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={editing?.unit_cost_price ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="batch_number">Batch number</label>
                  <input
                    id="batch_number"
                    name="batch_number"
                    required
                    defaultValue={editing?.batch_number ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="expiry_date">Expiry date</label>
                  <input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    defaultValue={editing?.expiry_date ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>
              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-sm border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {pending ? "Saving..." : "Save batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
