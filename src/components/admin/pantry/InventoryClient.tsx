"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatAdminDate } from "@/components/admin/AdminUi";
import { saveInventoryBatchAction } from "@/lib/admin/pantry-actions";
import type { FoodVaultInventoryBatch, FoodVaultProduct } from "@/types/commerce";

type BatchRow = FoodVaultInventoryBatch & {
  product_name?: string;
  product_sku?: string;
  product_brand?: string;
  quantity_remaining?: number;
};

type InventorySaleRow = {
  id: string;
  productId: string;
  sku: string;
  quantity: number;
  at: string;
  orderId: string;
};

type Movement = {
  id: string;
  at: string;
  kind: "Receipt" | "Sale";
  quantity: number;
  detail: string;
};

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

function brandOf(product: FoodVaultProduct): string {
  return product.brand?.trim() || "Unbranded";
}

function latestReceiptAt(productId: string, batches: BatchRow[]): number {
  let latest = 0;
  for (const batch of batches) {
    if (batch.product_id !== productId || !batch.created_at) continue;
    const time = new Date(batch.created_at).getTime();
    if (time > latest) latest = time;
  }
  return latest;
}

function movementsForProduct(
  product: FoodVaultProduct,
  batches: BatchRow[],
  sales: InventorySaleRow[]
): Movement[] {
  const receipts: Movement[] = [];
  for (const batch of batches) {
    if (batch.product_id !== product.id || !batch.created_at) continue;
    receipts.push({
      id: `receipt-${batch.id}`,
      at: batch.created_at,
      kind: "Receipt",
      quantity: batch.quantity_received,
      detail: [
        batch.batch_number ? `Batch ${batch.batch_number}` : null,
        `Remaining ${batch.quantity_remaining ?? batch.quantity_received}`,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  const sold: Movement[] = sales
    .filter((sale) => sale.productId === product.id || (sale.sku && sale.sku === product.sku))
    .map((sale) => ({
      id: `sale-${sale.id}`,
      at: sale.at,
      kind: "Sale" as const,
      quantity: -sale.quantity,
      detail: `Order ${sale.orderId.slice(0, 8)}`,
    }));

  return [...receipts, ...sold].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function InventoryClient({
  products,
  batches,
  sales,
}: {
  products: FoodVaultProduct[];
  batches: BatchRow[];
  sales: InventorySaleRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BatchRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [brand, setBrand] = useState("all");
  const [newestFirst, setNewestFirst] = useState(true);
  const [zeroStockOnly, setZeroStockOnly] = useState(false);

  const brands = useMemo(() => {
    const names = new Set(products.map(brandOf));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const stockByProductId = useMemo(() => {
    const stock = new Map<string, number>();
    for (const product of products) stock.set(product.id, product.stock_quantity);
    return stock;
  }, [products]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (brand !== "all" && brandOf(product) !== brand) return false;
      if (zeroStockOnly && product.stock_quantity > 0) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (newestFirst) {
        const byReceipt = latestReceiptAt(b.id, batches) - latestReceiptAt(a.id, batches);
        if (byReceipt !== 0) return byReceipt;
        return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [products, batches, brand, newestFirst, zeroStockOnly]);

  const visibleProductIds = useMemo(
    () => new Set(visibleProducts.map((product) => product.id)),
    [visibleProducts]
  );

  const visibleBatches = useMemo(() => {
    const rows = batches.filter((batch) => visibleProductIds.has(batch.product_id));
    return [...rows].sort((a, b) => {
      const delta = new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      return newestFirst ? delta : -delta;
    });
  }, [batches, visibleProductIds, newestFirst]);

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
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted">
            Add stock quantity to make products live on Vault Market. Product SOH updates
            automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Add inventory
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded border border-border bg-white p-4">
        <div className="min-w-[12rem]">
          <label className={labelClass} htmlFor="brand-filter">
            Brand
          </label>
          <select
            id="brand-filter"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className={inputClass}
          >
            <option value="all">All brands</option>
            {brands.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[12rem]">
          <label className={labelClass} htmlFor="newest-filter">
            Newest
          </label>
          <select
            id="newest-filter"
            value={newestFirst ? "newest" : "name"}
            onChange={(event) => setNewestFirst(event.target.value === "newest")}
            className={inputClass}
          >
            <option value="newest">Newest receipts first</option>
            <option value="name">Product name</option>
          </select>
        </div>
        <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={zeroStockOnly}
            onChange={(event) => setZeroStockOnly(event.target.checked)}
            className="size-4 accent-primary"
          />
          Zero stock on hand
        </label>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Qty received</th>
              <th className="px-4 py-3 font-semibold">Logged</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {visibleBatches.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted">
                  {batches.length === 0
                    ? "No inventory recorded yet."
                    : "No inventory matches these filters."}
                </td>
              </tr>
            ) : (
              visibleBatches.map((batch) => (
                <tr key={batch.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{batch.product_name ?? "Unknown"}</p>
                    <p className="text-xs text-muted">{batch.product_sku}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{batch.quantity_received}</td>
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

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Receipt and stock movement</h2>
          <p className="mt-1 text-sm text-muted">
            Each product lists every receipt and every sale, with the date and time stock moved.
          </p>
        </div>
        {visibleProducts.length === 0 ? (
          <p className="rounded border border-border bg-white px-4 py-8 text-center text-sm text-muted">
            No products match these filters.
          </p>
        ) : (
          visibleProducts.map((product) => {
            const movements = movementsForProduct(product, batches, sales);
            const onHand = stockByProductId.get(product.id) ?? 0;
            return (
              <details
                key={product.id}
                className="rounded border border-border bg-white"
                open={zeroStockOnly || visibleProducts.length <= 8}
              >
                <summary className="cursor-pointer list-none px-4 py-3">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span>
                      <span className="font-semibold text-foreground">{product.name}</span>
                      <span className="ml-2 text-xs text-muted">
                        {brandOf(product)} · {product.sku}
                      </span>
                    </span>
                    <span className="text-sm tabular-nums text-foreground">
                      {onHand} on hand
                    </span>
                  </span>
                </summary>
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-2 font-semibold">When</th>
                        <th className="px-4 py-2 font-semibold">Movement</th>
                        <th className="px-4 py-2 font-semibold">Qty</th>
                        <th className="px-4 py-2 font-semibold">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-sm text-muted">
                            No receipts or sales recorded.
                          </td>
                        </tr>
                      ) : (
                        movements.map((movement) => (
                          <tr key={movement.id} className="border-b border-border/70 last:border-0">
                            <td className="px-4 py-2 text-muted">{formatAdminDate(movement.at)}</td>
                            <td className="px-4 py-2 font-semibold text-foreground">{movement.kind}</td>
                            <td className="px-4 py-2 tabular-nums">
                              {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                            </td>
                            <td className="px-4 py-2 text-muted">{movement.detail}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })
        )}
      </section>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">
              {editing ? "Edit inventory" : "Add inventory"}
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
                  {pending ? "Saving..." : "Save inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
