"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { SafeImage } from "@/components/media/SafeImage";
import {
  BarcodeScanner,
  playScanErrorSound,
  playScanSuccessSound,
} from "@/components/admin/picker/BarcodeScanner";
import { fulfillPickerOrderAction } from "@/lib/admin/picker-actions";
import {
  displayBinLocation,
  packingSlipPath,
  PICKER_STORAGE_PREFIX,
  type PickerLine,
  type PickerOrderDetail,
} from "@/lib/admin/picker-shared";
import { normalizeScanCode } from "@/lib/admin/wms-shared";

function storageKey(orderId: string) {
  return `${PICKER_STORAGE_PREFIX}${orderId}`;
}

function loadPicked(orderId: string, lineIds: string[], alreadyFulfilled: boolean): Set<string> {
  if (alreadyFulfilled) return new Set(lineIds);
  try {
    const raw = window.localStorage.getItem(storageKey(orderId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const ids = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    return new Set(ids.filter((id) => lineIds.includes(id)));
  } catch {
    return new Set();
  }
}

export function PickerOrderClient({ order }: { order: PickerOrderDetail }) {
  const router = useRouter();
  const lineIds = useMemo(() => order.lines.map((line) => line.itemId), [order.lines]);
  const alreadyFulfilled = order.status === "fulfilled";
  const [picked, setPicked] = useState<Set<string>>(() =>
    alreadyFulfilled ? new Set(lineIds) : new Set()
  );
  const [hydrated, setHydrated] = useState(alreadyFulfilled);
  const [modalOpen, setModalOpen] = useState(false);
  const [wrongScan, setWrongScan] = useState<string | null>(null);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPicked(loadPicked(order.id, lineIds, alreadyFulfilled));
    setHydrated(true);
  }, [alreadyFulfilled, lineIds, order.id]);

  useEffect(() => {
    if (!hydrated || alreadyFulfilled) return;
    window.localStorage.setItem(storageKey(order.id), JSON.stringify([...picked]));
  }, [alreadyFulfilled, hydrated, order.id, picked]);

  const total = order.lines.length;
  const pickedCount = order.lines.filter((line) => picked.has(line.itemId)).length;
  const percent = total === 0 ? 0 : Math.round((pickedCount / total) * 100);
  const complete = total > 0 && pickedCount === total;

  function toggleLine(itemId: string) {
    if (alreadyFulfilled) return;
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function lineMatchesScan(line: PickerLine, code: string) {
    const scanned = normalizeScanCode(code).toLowerCase();
    return [line.barcode, line.sku].some(
      (value) => value && normalizeScanCode(value).toLowerCase() === scanned
    );
  }

  function handlePickScan(code: string) {
    if (alreadyFulfilled) return;
    setPicked((current) => {
      const match = order.lines.find((line) => lineMatchesScan(line, code) && !current.has(line.itemId));
      if (!match) {
        playScanErrorSound();
        setWrongScan(code);
        return current;
      }
      playScanSuccessSound();
      setWrongScan(null);
      const next = new Set(current);
      next.add(match.itemId);
      return next;
    });
  }

  function openPackingSlip(autoprint = false) {
    window.open(packingSlipPath(order.id, autoprint), "_blank", "noopener,noreferrer");
  }

  function submitFulfill(printFirst = false) {
    setError(null);
    if (printFirst) {
      window.open(packingSlipPath(order.id, true), "_blank", "noopener,noreferrer");
    }
    const formData = new FormData();
    formData.set("order_id", order.id);
    formData.set("tracking_number", tracking.trim());
    startTransition(async () => {
      const result = await fulfillPickerOrderAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      window.localStorage.removeItem(storageKey(order.id));
      setModalOpen(false);
      router.push("/admin/picker");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-xl flex-col">
      <div className="sticky top-14 z-30 border-b border-border bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Picking</p>
            <h1 className="font-mono text-xl font-bold text-foreground">#{order.shortId}</h1>
            <p className="mt-0.5 text-sm text-muted">{order.customerName}</p>
          </div>
          <p className="text-right text-sm font-bold text-primary">
            {percent}%
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">
            Picked {pickedCount} of {total} items — {percent}% Complete
          </p>
          <button
            type="button"
            onClick={() => openPackingSlip(false)}
            className="shrink-0 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-foreground"
          >
            Print Packing Slip
          </button>
        </div>
        {!alreadyFulfilled ? (
          <div className="mt-3">
            <BarcodeScanner onScan={handlePickScan} placeholder="Scan product barcode to pick" />
          </div>
        ) : null}
      </div>

      <ol className="flex-1 space-y-3 px-4 py-4 pb-32">
        {order.lines.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
            This order has no line items.
          </li>
        ) : (
          order.lines.map((line) => {
            const isPicked = picked.has(line.itemId);
            const assigned = Boolean(line.binLocation.trim());
            return (
              <li key={line.itemId}>
                <button
                  type="button"
                  onClick={() => toggleLine(line.itemId)}
                  aria-pressed={isPicked}
                  className={`flex w-full gap-3 rounded-2xl border p-3 text-left shadow-sm transition-colors ${
                    isPicked
                      ? "border-slate-200 bg-slate-100"
                      : "border-border bg-white"
                  }`}
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <SafeImage
                      src={line.imageUrl ?? ""}
                      alt={line.name}
                      fill
                      sizes="96px"
                      className={`object-cover ${isPicked ? "opacity-50 grayscale" : ""}`}
                      fallbackVariant="muted"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        assigned
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {displayBinLocation(line.binLocation)}
                    </span>
                    <p
                      className={`mt-1 text-base font-bold leading-snug text-foreground ${
                        isPicked ? "text-slate-500 line-through" : ""
                      }`}
                    >
                      {line.name}
                    </p>
                    <p className={`text-xs text-muted ${isPicked ? "line-through" : ""}`}>
                      {line.brand}
                      {line.sku ? ` · ${line.sku}` : ""}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p
                        className={`text-3xl font-black tracking-tight ${
                          isPicked ? "text-slate-400 line-through" : "text-primary"
                        }`}
                      >
                        QTY: {line.quantity}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          isPicked ? "bg-slate-200 text-slate-600" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isPicked ? "Picked" : "Pending"}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ol>

      <div className="sticky bottom-0 z-30 border-t border-border bg-white/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur">
        {alreadyFulfilled ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
            This order is already fulfilled
            {order.trackingNumber ? ` · ${order.trackingNumber}` : ""}.
          </p>
        ) : (
          <button
            type="button"
            disabled={!complete}
            onClick={() => setModalOpen(true)}
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Mark Order as Fulfilled
          </button>
        )}
      </div>

      {wrongScan ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-red-700">Wrong barcode</h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-mono">{wrongScan}</span> is not an unpicked line on this order.
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

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fulfill-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
          >
            <h2 id="fulfill-title" className="text-lg font-bold text-foreground">
              Dispatch order #{order.shortId}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Optional courier tracking number (NZ Post / CourierPost).
            </p>
            <label className="mt-4 block text-sm font-semibold text-foreground" htmlFor="tracking_number">
              Tracking number
            </label>
            <input
              id="tracking_number"
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
              placeholder="e.g. NZ123456789"
              className="mt-1 w-full rounded-xl border border-border px-3 py-3 text-base"
              autoComplete="off"
            />
            {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => submitFulfill(true)}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground"
              >
                {pending ? "Saving…" : "Print & Dispatch"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setModalOpen(false)}
                  className="min-h-12 rounded-xl border border-border text-sm font-bold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => submitFulfill(false)}
                  className="min-h-12 rounded-xl border border-border text-sm font-bold text-foreground"
                >
                  {pending ? "Saving…" : "Dispatch only"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
