"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import {
  amountToMinorUnits,
  minorUnitsToAmount,
  settlePicks,
} from "@/lib/commerce/pick-settlement";
import { formatNzPrice } from "@/lib/partner-offer";

function storageKey(orderId: string) {
  return `${PICKER_STORAGE_PREFIX}${orderId}`;
}

function loadPicks(
  orderId: string,
  lines: PickerLine[],
  alreadyClosed: boolean
): Record<string, number | null> {
  const picks: Record<string, number | null> = {};
  for (const line of lines) {
    picks[line.itemId] = alreadyClosed ? (line.quantityPicked ?? line.quantity) : line.quantityPicked;
  }
  if (alreadyClosed) return picks;

  try {
    const raw = window.localStorage.getItem(storageKey(orderId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (Array.isArray(parsed)) {
      for (const id of parsed) {
        if (typeof id !== "string" || picks[id] != null) continue;
        const line = lines.find((entry) => entry.itemId === id);
        if (line) picks[id] = line.quantity;
      }
    } else if (parsed && typeof parsed === "object") {
      const stored = parsed as Record<string, unknown>;
      for (const line of lines) {
        if (picks[line.itemId] != null) continue;
        const value = stored[line.itemId];
        if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= line.quantity) {
          picks[line.itemId] = value;
        }
      }
    }
  } catch {
    return picks;
  }

  return picks;
}

export function PickerOrderClient({ order }: { order: PickerOrderDetail }) {
  const router = useRouter();
  const alreadyFulfilled = order.status === "fulfilled";
  const alreadyClosed = alreadyFulfilled || order.status === "cancelled" || order.status === "refunded";
  const [picks, setPicks] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(order.lines.map((line) => [line.itemId, alreadyClosed ? line.quantity : null]))
  );
  const [hydrated, setHydrated] = useState(alreadyClosed);
  const [modalOpen, setModalOpen] = useState(false);
  const [wrongScan, setWrongScan] = useState<string | null>(null);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [pending, startTransition] = useTransition();
  const submitGuard = useRef(false);

  useEffect(() => {
    setPicks(loadPicks(order.id, order.lines, alreadyClosed));
    setHydrated(true);
  }, [alreadyClosed, order.id, order.lines]);

  useEffect(() => {
    if (!hydrated || alreadyClosed) return;
    window.localStorage.setItem(storageKey(order.id), JSON.stringify(picks));
  }, [alreadyClosed, hydrated, order.id, picks]);

  const settlement = useMemo(
    () =>
      settlePicks({
        currency: order.currency,
        shippingCost: order.shippingCost,
        authorizedMinor: amountToMinorUnits(order.total, order.currency),
        lines: order.lines.map((line) => ({
          itemId: line.itemId,
          name: line.name,
          sku: line.sku,
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal,
          quantityPicked: picks[line.itemId] ?? null,
        })),
      }),
    [order, picks]
  );

  const total = order.lines.length;
  const resolvedCount = order.lines.filter((line) => picks[line.itemId] != null).length;
  const percent = total === 0 ? 0 : Math.round((resolvedCount / total) * 100);
  const chargeLabel = formatNzPrice(minorUnitsToAmount(settlement.totalMinor, order.currency));
  const holdLabel = formatNzPrice(order.total);
  const busy = locked || pending;

  function setLineQty(itemId: string, quantity: number | null) {
    if (alreadyClosed) return;
    setPicks((current) => ({ ...current, [itemId]: quantity }));
  }

  function lineMatchesScan(line: PickerLine, code: string) {
    const scanned = normalizeScanCode(code).toLowerCase();
    return [line.barcode, line.sku].some(
      (value) => value && normalizeScanCode(value).toLowerCase() === scanned
    );
  }

  function handlePickScan(code: string) {
    if (alreadyClosed) return;
    const match = order.lines.find(
      (line) => lineMatchesScan(line, code) && picks[line.itemId] !== line.quantity
    );
    if (!match) {
      playScanErrorSound();
      setWrongScan(code);
      return;
    }
    playScanSuccessSound();
    setWrongScan(null);
    setLineQty(match.itemId, match.quantity);
  }

  function openPackingSlip(autoprint = false) {
    window.open(packingSlipPath(order.id, autoprint), "_blank", "noopener,noreferrer");
  }

  function submitFulfill(printFirst = false) {
    if (submitGuard.current || busy || settlement.unresolved) return;
    submitGuard.current = true;
    setLocked(true);
    setError(null);
    const formData = new FormData();
    formData.set("order_id", order.id);
    formData.set("tracking_number", tracking.trim());
    formData.set(
      "picks",
      JSON.stringify(
        Object.fromEntries(
          order.lines.map((line) => [line.itemId, picks[line.itemId] ?? 0])
        )
      )
    );
    startTransition(async () => {
      const result = await fulfillPickerOrderAction(formData);
      if ("error" in result) {
        submitGuard.current = false;
        setLocked(false);
        setError(result.error);
        return;
      }
      window.localStorage.removeItem(storageKey(order.id));
      if (printFirst && !result.cancelled) openPackingSlip(true);
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
          <p className="text-right text-sm font-bold text-primary">{percent}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">
            Resolved {resolvedCount} of {total} lines — {percent}%
          </p>
          <button
            type="button"
            onClick={() => openPackingSlip(false)}
            className="shrink-0 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-foreground"
          >
            Print Packing Slip
          </button>
        </div>
        {!alreadyClosed ? (
          <div className="mt-3">
            <BarcodeScanner onScan={handlePickScan} placeholder="Scan product barcode to pick" />
          </div>
        ) : null}
      </div>

      <ol className="flex-1 space-y-3 px-4 py-4 pb-36">
        {order.lines.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border bg-white px-5 py-10 text-center text-sm text-muted">
            This order has no line items.
          </li>
        ) : (
          order.lines.map((line) => {
            const pickedQty = picks[line.itemId];
            const isPicked = pickedQty != null && pickedQty > 0;
            const isOut = pickedQty === 0;
            const assigned = Boolean(line.binLocation.trim());
            return (
              <li
                key={line.itemId}
                className={`rounded-2xl border p-3 shadow-sm ${
                  isOut ? "border-slate-200 bg-slate-100" : isPicked ? "border-emerald-200 bg-emerald-50/40" : "border-border bg-white"
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <SafeImage
                      src={line.imageUrl ?? ""}
                      alt={line.name}
                      fill
                      sizes="96px"
                      className={`object-cover ${isOut ? "opacity-50 grayscale" : ""}`}
                      fallbackVariant="muted"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        assigned ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {displayBinLocation(line.binLocation)}
                    </span>
                    <p className={`mt-1 text-base font-bold leading-snug text-foreground ${isOut ? "text-slate-500 line-through" : ""}`}>
                      {line.name}
                    </p>
                    <p className={`text-xs text-muted ${isOut ? "line-through" : ""}`}>
                      {line.brand}
                      {line.sku ? ` · ${line.sku}` : ""}
                    </p>
                    <p className={`mt-2 text-sm font-bold ${isOut ? "text-slate-400 line-through" : "text-primary"}`}>
                      Ordered {line.quantity}
                      {line.lineTotal > 0 ? ` · ${formatNzPrice(line.lineTotal)}` : ""}
                    </p>
                  </div>
                </div>
                {alreadyClosed ? (
                  <p className="mt-3 text-sm font-semibold text-muted">
                    {isOut ? "Out of stock" : `Picked ${pickedQty ?? line.quantity}`}
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        aria-pressed={isPicked}
                        onClick={() => setLineQty(line.itemId, line.quantity)}
                        className={`min-h-11 rounded-xl text-sm font-bold ${
                          isPicked ? "bg-primary text-primary-foreground" : "border border-border bg-white text-foreground"
                        }`}
                      >
                        Picked
                      </button>
                      <button
                        type="button"
                        aria-pressed={isOut}
                        onClick={() => setLineQty(line.itemId, 0)}
                        className={`min-h-11 rounded-xl text-sm font-bold ${
                          isOut ? "bg-slate-700 text-white" : "border border-border bg-white text-foreground"
                        }`}
                      >
                        Out of stock
                      </button>
                    </div>
                    {isPicked && line.quantity > 1 ? (
                      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                        <span className="text-sm font-semibold text-foreground">Picked qty</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setLineQty(line.itemId, Math.max(0, (pickedQty ?? 0) - 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-lg font-bold"
                            aria-label={`Decrease picked quantity for ${line.name}`}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-base font-bold">{pickedQty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setLineQty(line.itemId, Math.min(line.quantity, (pickedQty ?? 0) + 1))
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-lg font-bold"
                            aria-label={`Increase picked quantity for ${line.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
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
        ) : order.status === "cancelled" || order.status === "refunded" ? (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">
            This order is {order.status}.
          </p>
        ) : (
          <>
            {!settlement.unresolved ? (
              <p className="mb-2 text-center text-sm font-semibold text-foreground">
                {settlement.allOutOfStock
                  ? "Nothing to pack. The card hold will be released."
                  : `Charge ${chargeLabel} of ${holdLabel} on hold`}
              </p>
            ) : null}
            <button
              type="button"
              disabled={settlement.unresolved || total === 0 || busy}
              onClick={() => {
                setError(null);
                setModalOpen(true);
              }}
              className="flex min-h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {settlement.unresolved
                ? "Resolve every line"
                : settlement.allOutOfStock
                  ? "Cancel order and release hold"
                  : "Review charge and fulfill"}
            </button>
          </>
        )}
      </div>

      {wrongScan ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-red-700">Wrong barcode</h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-mono">{wrongScan}</span> is not an open line on this order.
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
              {settlement.allOutOfStock ? `Cancel order #${order.shortId}` : `Dispatch order #${order.shortId}`}
            </h2>
            {settlement.allOutOfStock ? (
              <p className="mt-1 text-sm text-muted">
                Every line is out of stock. The authorization will be cancelled and the customer will not be charged.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted">
                  {settlement.adjustments.length > 0
                    ? `Capture ${chargeLabel}. The rest of the ${holdLabel} hold is released.`
                    : `Capture the full ${chargeLabel} hold.`}
                </p>
                {settlement.adjustments.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm text-foreground">
                    {settlement.adjustments.map((line) => (
                      <li key={line.itemId}>
                        {line.name}: picked {line.picked} of {line.ordered}
                      </li>
                    ))}
                  </ul>
                ) : null}
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
              </>
            )}
            {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
            <div className="mt-5 space-y-2">
              {settlement.allOutOfStock ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submitFulfill(false)}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy ? "Releasing hold…" : "Release hold and cancel"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submitFulfill(true)}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60"
                >
                  {busy ? "Capturing…" : "Print, capture, and dispatch"}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setModalOpen(false)}
                  className="min-h-12 rounded-xl border border-border text-sm font-bold text-foreground"
                >
                  Back
                </button>
                {settlement.allOutOfStock ? null : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitFulfill(false)}
                    className="min-h-12 rounded-xl border border-border text-sm font-bold text-foreground"
                  >
                    {busy ? "Capturing…" : "Capture only"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
