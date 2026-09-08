"use client";

import { useState, useTransition } from "react";
import { SafeImage } from "@/components/media/SafeImage";
import { BarcodeScanner, playScanErrorSound, playScanSuccessSound } from "@/components/admin/picker/BarcodeScanner";
import { lookupProductScanAction } from "@/lib/admin/wms-actions";
import { displayBinLocation } from "@/lib/admin/picker-shared";
import type { ProductScanInfo } from "@/lib/admin/wms-shared";

export function PickerScanLookupClient() {
  const [product, setProduct] = useState<ProductScanInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleScan(code: string) {
    setError(null);
    startTransition(async () => {
      const result = await lookupProductScanAction(code);
      if (result.error || !result.product) {
        playScanErrorSound();
        setProduct(null);
        setError(result.error ?? "No product matches that barcode.");
        return;
      }
      playScanSuccessSound();
      setProduct(result.product);
    });
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-4">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Scan product info</h1>
      <p className="mt-1 text-sm text-muted">
        Scan any barcode for name, image, SOH, bin location, and expiry dates.
      </p>
      <div className="mt-4 rounded-2xl border border-border bg-white p-4">
        <BarcodeScanner onScan={handleScan} disabled={pending} />
      </div>
      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}
      {product ? (
        <article className="mt-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <SafeImage
                src={product.imageUrl ?? ""}
                alt={product.name}
                fill
                sizes="112px"
                className="object-cover"
                fallbackVariant="muted"
              />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-foreground">{product.name}</p>
              <p className="text-xs text-muted">
                {product.sku}
                {product.barcode ? ` · ${product.barcode}` : ""}
              </p>
              <p className="mt-3 text-3xl font-black text-primary">SOH {product.stockQuantity}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Bin {displayBinLocation(product.binLocation ?? "")}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Expiry dates</h2>
            {product.batches.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No inventory batches on file.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {product.batches.map((batch) => (
                  <li key={batch.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <p className="font-semibold text-foreground">{batch.batchNumber}</p>
                    <p className="text-muted">
                      {batch.expiryDate || "No expiry"} · {batch.quantityReceived} units
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ) : null}
    </div>
  );
}
