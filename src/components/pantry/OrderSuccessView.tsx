"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearVaultMarketCart } from "@/lib/commerce/cart";
import { formatNzPrice } from "@/lib/partner-offer";
import { heading1 } from "@/lib/ui-classes";
import type { FoodVaultOrder, FoodVaultShippingAddress } from "@/types/commerce";

function formatShipping(shipping: FoodVaultShippingAddress | null | undefined) {
  if (!shipping) return [];
  return [
    shipping.name,
    shipping.line1,
    shipping.line2,
    [shipping.city, shipping.state, shipping.postal_code].filter(Boolean).join(" "),
    shipping.country,
  ].filter(Boolean) as string[];
}

export function OrderSuccessView({
  sessionId,
  initialOrder,
}: {
  sessionId: string;
  initialOrder: FoodVaultOrder | null;
}) {
  const [order, setOrder] = useState<FoodVaultOrder | null>(initialOrder);

  useEffect(() => {
    clearVaultMarketCart();
  }, []);

  useEffect(() => {
    if (order || !sessionId) return;

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const response = await fetch(
          `/api/pantry/order?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = (await response.json()) as { order?: FoodVaultOrder | null };
        if (!cancelled && data.order) {
          setOrder(data.order);
          return;
        }
      } catch {
        // Webhook may still be processing.
      }

      if (!cancelled && attempts < 10) {
        window.setTimeout(() => void poll(), 1500);
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [order, sessionId]);

  const shippingLines = formatShipping(order?.shipping);
  const savings = order?.total_savings ?? 0;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="section-label">Vault Market</p>
      <h1 className={`${heading1} mt-2`}>Order confirmed</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Thanks for shopping the pantry. Your member price is locked in on this order.
      </p>

      <article className="fv-card mt-8 rounded-lg border border-border bg-background p-6 sm:p-8">
        {order ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Order ID
            </p>
            <p className="mt-1 break-all font-mono text-sm font-bold text-foreground">
              {order.id}
            </p>

            <div className="mt-6">
              <h2 className="text-sm font-bold text-foreground">Items purchased</h2>
              <ul className="mt-3 divide-y divide-border">
                {(order.items ?? []).map((item) => (
                  <li
                    key={item.id || `${item.sku}-${item.name}`}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        Qty {item.quantity}
                        {item.sku ? ` · ${item.sku}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-primary">
                      {formatNzPrice(item.line_total)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-bold text-foreground">Shipping address</h2>
              {shippingLines.length > 0 ? (
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {shippingLines.join("\n")}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No shipping address was captured for this order.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-lg border border-success/20 bg-success-light px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-success">
                Total Member Savings
              </p>
              <p className="mt-1 text-2xl font-bold text-success">
                {formatNzPrice(savings)}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Order total {formatNzPrice(order.total)}
              </p>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-foreground">Confirming your payment</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Stripe is finishing the order. This page will update automatically in a
              few seconds.
            </p>
          </div>
        )}
      </article>

      <Link
        href="/pantry"
        className="fv-btn-primary mt-8 inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground"
      >
        Back to the pantry
      </Link>
    </div>
  );
}
