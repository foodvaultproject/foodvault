"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BarcodeScanner,
  playScanErrorSound,
  playScanSuccessSound,
} from "@/components/admin/picker/BarcodeScanner";
import { completeReceivingAction, receivePoItemAction } from "@/lib/admin/wms-actions";
import {
  DISCREPANCY_REASONS,
  claimValue,
  normalizeScanCode,
  type PurchaseOrderItem,
  type PurchaseOrderRecord,
} from "@/lib/admin/wms-shared";
import { formatNzPrice } from "@/lib/partner-offer";

function matchesScan(item: PurchaseOrderItem, code: string) {
  const scanned = normalizeScanCode(code).toLowerCase();
  return [item.barcode, item.sku].some((value) => value && normalizeScanCode(value).toLowerCase() === scanned);
}

export function PickerReceiveClient({ order }: { order: PurchaseOrderRecord }) {
  const router = useRouter();
  const alreadyReceived = order.status === "received";
  const [items, setItems] = useState(order.items);
  const [pendingItem, setPendingItem] = useState<PurchaseOrderItem | null>(null);
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wrongScan, setWrongScan] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const claimTotal = useMemo(
    () => items.reduce((sum, item) => sum + claimValue(item.quantityOrdered, item.quantityReceived, item.costPrice), 0),
    [items]
  );

  function onScan(code: string) {
    if (alreadyReceived) return;
    const match = items.find((item) => matchesScan(item, code) && item.quantityReceived < item.quantityOrdered)
      ?? items.find((item) => matchesScan(item, code));
    if (!match) {
      playScanErrorSound();
      setWrongScan(code);
      return;
    }
    playScanSuccessSound();
    setWrongScan(null);
    setPendingItem(match);
    setBatchNumber(match.batchNumber ?? "");
    setExpiryDate(match.expiryDate ?? "");
  }

  function saveReceipt() {
    if (!pendingItem) return;
    if (!batchNumber.trim() || !expiryDate.trim()) {
      setError("Batch number and expiry date are required.");
      return;
    }
    setError(null);
    const nextQty = Math.min(pendingItem.quantityOrdered, pendingItem.quantityReceived + 1);
    const formData = new FormData();
    formData.set("item_id", pendingItem.id);
    formData.set("po_id", order.id);
    formData.set("quantity_received", String(nextQty));
    formData.set("batch_number", batchNumber.trim());
    formData.set("expiry_date", expiryDate);
    formData.set("discrepancy_reason", pendingItem.discrepancyReason ?? "");
    startTransition(async () => {
      const result = await receivePoItemAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((current) =>
        current.map((item) =>
          item.id === pendingItem.id
            ? {
                ...item,
                quantityReceived: nextQty,
                batchNumber: batchNumber.trim(),
                expiryDate,
                discrepancyQty: Math.max(0, item.quantityOrdered - nextQty),
              }
            : item
        )
      );
      setPendingItem(null);
      router.refresh();
    });
  }

  function saveReason(itemId: string, reason: string) {
    const item = items.find((row) => row.id === itemId);
    if (!item) return;
    const formData = new FormData();
    formData.set("item_id", item.id);
    formData.set("po_id", order.id);
    formData.set("quantity_received", String(item.quantityReceived));
    formData.set("batch_number", item.batchNumber ?? "");
    formData.set("expiry_date", item.expiryDate ?? "");
    formData.set("discrepancy_reason", reason);
    startTransition(async () => {
      const result = await receivePoItemAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((current) =>
        current.map((row) => (row.id === itemId ? { ...row, discrepancyReason: reason as typeof row.discrepancyReason } : row))
      );
    });
  }

  function completeReceiving() {
    setError(null);
    const formData = new FormData();
    formData.set("po_id", order.id);
    startTransition(async () => {
      const result = await completeReceivingAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.creditNoteId) {
        router.push(`/admin/credit-notes/${result.creditNoteId}`);
      } else {
        router.push("/admin/picker/receive");
      }
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-xl flex-col">
      <div className="sticky top-14 z-30 border-b border-border bg-white/95 px-4 py-3 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Receiving</p>
        <h1 className="font-mono text-xl font-bold">{order.poNumber}</h1>
        <p className="text-sm text-muted">{order.vendorName}</p>
        <div className="mt-3">
          <BarcodeScanner onScan={onScan} disabled={alreadyReceived || pending} placeholder="Scan inbound barcode" />
        </div>
      </div>

      <ul className="flex-1 space-y-3 px-4 py-4 pb-40">
        {items.map((item) => {
          const short = item.quantityReceived < item.quantityOrdered;
          return (
            <li key={item.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="font-bold text-foreground">{item.name}</p>
              <p className="text-xs text-muted">
                {item.sku}
                {item.barcode ? ` · ${item.barcode}` : ""}
              </p>
              <p className="mt-2 text-2xl font-black text-primary">
                {item.quantityReceived}/{item.quantityOrdered}
              </p>
              {short ? (
                <label className="mt-3 block text-sm font-semibold">
                  Discrepancy reason
                  <select
                    value={item.discrepancyReason ?? "short_supply"}
                    disabled={alreadyReceived}
                    onChange={(event) => saveReason(item.id, event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    {DISCREPANCY_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="mt-2 text-sm font-semibold text-emerald-700">Line complete</p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-0 z-30 border-t border-border bg-white/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        {error ? <p className="mb-2 text-sm font-medium text-red-600">{error}</p> : null}
        <p className="mb-2 text-sm font-semibold text-foreground">
          Claim value {formatNzPrice(claimTotal)}
        </p>
        {alreadyReceived ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
            This PO is already received.
          </p>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={completeReceiving}
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground"
          >
            {pending ? "Saving…" : "Complete Receiving & Generate Credit Claim"}
          </button>
        )}
      </div>

      {wrongScan ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-red-700">Wrong barcode</h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-mono">{wrongScan}</span> is not on this purchase order.
            </p>
            <button
              type="button"
              onClick={() => setWrongScan(null)}
              className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground"
            >
              Scan again
            </button>
          </div>
        </div>
      ) : null}

      {pendingItem ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Batch & expiry</h2>
            <p className="mt-1 text-sm text-muted">{pendingItem.name}</p>
            <label className="mt-4 block text-sm font-semibold">
              Batch number
              <input
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-3"
              />
            </label>
            <label className="mt-3 block text-sm font-semibold">
              Expiry date
              <input
                type="date"
                value={expiryDate}
                onChange={(event) => setExpiryDate(event.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-3"
              />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPendingItem(null)} className="min-h-12 rounded-xl border border-border font-bold">
                Cancel
              </button>
              <button type="button" disabled={pending} onClick={saveReceipt} className="min-h-12 rounded-xl bg-primary font-bold text-primary-foreground">
                Save unit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
