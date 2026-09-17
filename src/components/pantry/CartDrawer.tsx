"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SafeImage } from "@/components/media/SafeImage";
import { cartMemberSavings, cartMemberSubtotal } from "@/lib/commerce/cart";
import {
  amountToFreeShipping,
  qualifiesForFreeShipping,
  vaultMarketFreight,
} from "@/lib/commerce/shipping";
import { formatNzPrice } from "@/lib/partner-offer";
import type { CartItem } from "@/types/commerce";

type CartDrawerProps = {
  open: boolean;
  items: CartItem[];
  memberUnlocked?: boolean;
  onMembershipRequired?: (savings: number) => void;
  onClose: () => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
};

export function CartDrawer({
  open,
  items,
  memberUnlocked = true,
  onMembershipRequired,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
}: CartDrawerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const savings = cartMemberSavings(items);
  const subtotal = cartMemberSubtotal(items);
  const freight = vaultMarketFreight(subtotal);
  const remainingToFree = amountToFreeShipping(subtotal);
  const freeShipping = qualifiesForFreeShipping(subtotal);
  const total = subtotal + freight;

  function handleCheckout() {
    if (items.length === 0) return;
    if (!memberUnlocked) {
      onMembershipRequired?.(savings);
      return;
    }

    onClose();
    router.push("/pantry/checkout");
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  const drawer = (
    <div
      inert={!open ? true : undefined}
      className={`fixed inset-0 z-[110] ${open ? "" : "pointer-events-none"}`}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close cart"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-vm-primary" aria-hidden="true" />
            <h2 id={titleId} className="text-lg font-bold text-foreground">
              Your cart
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-vm-primary/10 text-vm-primary">
                <ShoppingBag className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-4 text-base font-bold text-foreground">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add pantry items to see member pricing and savings here.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-surface">
                    <SafeImage
                      src={item.image_url ?? ""}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      fallbackVariant="muted"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-vm-primary">{item.brand}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-bold text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-vm-primary">
                      {formatNzPrice(item.member_price)}
                      <span className="ml-2 text-xs font-medium text-muted-light line-through">
                        {formatNzPrice(item.retail_price)}
                      </span>
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          onClick={() => onDecrement(item.product_id)}
                          className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-surface"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrement(item.product_id)}
                          className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-surface"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(item.product_id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-danger"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border bg-background px-5 py-4">
          {items.length > 0 ? (
            freeShipping ? (
              <div className="rounded-lg border border-success/20 bg-success-light px-4 py-3">
                <p className="text-sm font-semibold text-success">
                  Free NZ Shipping unlocked
                </p>
                <p className="mt-1 text-xs text-success/80">
                  Your order is over $100.00, so freight is $0.00.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-[#10B981]/25 bg-[#10B981]/10 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  Add{" "}
                  <span className="font-bold text-[#059669]">
                    ${remainingToFree.toFixed(2)}
                  </span>{" "}
                  more to claim Free Shipping!
                </p>
                <Link
                  href="/pantry"
                  onClick={onClose}
                  className="mt-2 inline-flex text-sm font-semibold text-[#059669] underline-offset-2 hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            )
          ) : null}

          <div className="mt-4 rounded-lg border border-success/20 bg-success-light px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-success">
              Total Member Savings
            </p>
            <p className="mt-1 text-2xl font-bold text-success">
              {formatNzPrice(savings)}
            </p>
            <p className="mt-1 text-xs text-success/80">
              The difference between retail and member price across your cart.
            </p>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="font-semibold text-muted">Subtotal</dt>
              <dd className="font-bold text-foreground">{formatNzPrice(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-semibold text-muted">Freight</dt>
              <dd className="font-bold text-foreground">
                {freight === 0 ? "FREE" : formatNzPrice(freight)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-2">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="text-lg font-bold text-foreground">
                {formatNzPrice(total)}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleCheckout}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-vm-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            Proceed to Member Checkout
          </button>
        </div>
      </aside>
    </div>
  );

  if (!mounted) return null;
  return createPortal(drawer, document.body);
}
