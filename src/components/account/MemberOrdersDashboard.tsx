"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SafeImage } from "@/components/media/SafeImage";
import {
  addProductToCart,
  readVaultMarketCart,
  requestVaultMarketCartOpen,
  writeVaultMarketCart,
} from "@/lib/commerce/cart";
import type { MemberOrderHistoryItem } from "@/lib/commerce/member-orders";
import { formatNzPrice } from "@/lib/partner-offer";

const statusStyles: Record<string, string> = {
  Paid: "bg-amber-50 text-amber-800",
  Packing: "bg-blue-50 text-blue-700",
  Dispatched: "bg-emerald-50 text-emerald-700",
  Delivered: "bg-emerald-50 text-emerald-800",
  Cancelled: "bg-slate-100 text-slate-600",
  Refunded: "bg-slate-100 text-slate-600",
};

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    dateStyle: "medium",
  }).format(date);
}

export function MemberOrdersDashboard({
  lifetimeSavings,
  orders,
}: {
  lifetimeSavings: number;
  orders: MemberOrderHistoryItem[];
}) {
  const router = useRouter();
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  function reorder(order: MemberOrderHistoryItem) {
    if (order.reorderLines.length === 0) return;
    setReorderingId(order.id);
    let next = readVaultMarketCart();
    for (const line of order.reorderLines) {
      next = addProductToCart(next, line.product, line.quantity);
    }
    writeVaultMarketCart(next);
    requestVaultMarketCartOpen();
    router.push("/pantry");
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
        <p className="text-sm font-semibold text-primary">
          <Link href="/account" className="hover:text-primary-hover">
            My Account
          </Link>
          <span className="text-muted"> / Orders</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Vault Market orders</h1>
        <p className="mt-1 text-sm text-muted">
          Track pantry orders, savings, and reorder staples in one tap.
        </p>

        <section className="mt-6 rounded-2xl bg-primary px-5 py-6 text-primary-foreground shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-foreground/80">
            Lifetime member savings
          </p>
          <p className="mt-2 text-4xl font-bold">{formatNzPrice(lifetimeSavings)}</p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Total saved across completed Vault Market orders.
          </p>
        </section>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-white px-5 py-12 text-center">
            <p className="font-semibold text-foreground">No pantry orders yet</p>
            <p className="mt-1 text-sm text-muted">
              Member pricing starts as soon as you check out from Vault Market.
            </p>
            <Link
              href="/pantry"
              className="fv-btn-primary mt-4 inline-flex h-11 items-center justify-center rounded-sm px-4 text-sm font-semibold text-primary-foreground"
            >
              Shop Vault Market
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg font-bold text-foreground">#{order.shortId}</p>
                    <p className="text-sm text-muted">{formatOrderDate(order.createdAt)}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      statusStyles[order.displayStatus] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {order.displayStatus}
                  </span>
                </div>

                {order.thumbnails.length > 0 ? (
                  <div className="mt-3 flex -space-x-2">
                    {order.thumbnails.map((src) => (
                      <div
                        key={src}
                        className="relative h-12 w-12 overflow-hidden rounded-lg border border-white bg-surface"
                      >
                        <SafeImage
                          src={src}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                          fallbackVariant="muted"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-sm text-muted">Total paid</p>
                  <p className="text-base font-bold text-foreground">{formatNzPrice(order.total)}</p>
                </div>
                {order.totalSavings > 0 ? (
                  <p className="mt-1 text-right text-xs font-semibold text-success">
                    Saved {formatNzPrice(order.totalSavings)}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-sm border border-border text-sm font-semibold text-foreground hover:bg-surface"
                    >
                      Track parcel
                    </a>
                  ) : null}
                  <button
                    type="button"
                    disabled={order.reorderLines.length === 0 || reorderingId === order.id}
                    onClick={() => reorder(order)}
                    className="fv-btn-primary inline-flex h-11 flex-1 items-center justify-center rounded-sm px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {order.reorderLines.length === 0
                      ? "Items unavailable"
                      : reorderingId === order.id
                        ? "Adding…"
                        : "1-Click Reorder"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
