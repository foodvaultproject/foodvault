"use client";

import { Heart, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SafeImage } from "@/components/media/SafeImage";
import { formatNzPrice } from "@/lib/partner-offer";
import type { GroceryListItem } from "@/types/commerce";

type GroceryListDrawerProps = {
  open: boolean;
  items: GroceryListItem[];
  onClose: () => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onSelectedChange: (productId: string, selected: boolean) => void;
  onRemove: (productId: string) => void;
  onAddSelectedToCart: () => void;
};

export function GroceryListDrawer({
  open,
  items,
  onClose,
  onQuantityChange,
  onSelectedChange,
  onRemove,
  onAddSelectedToCart,
}: GroceryListDrawerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const selected = useMemo(() => items.filter((item) => item.selected), [items]);
  const selectedCount = selected.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = items.length > 0 && selected.length === items.length;

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
        aria-label="Close grocery list"
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
            <Heart className="h-5 w-5 text-vm-primary" aria-hidden="true" />
            <h2 id={titleId} className="text-lg font-bold text-foreground">
              My Grocery List
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close grocery list"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-vm-primary/10 text-vm-primary">
                <Heart className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-4 text-base font-bold text-foreground">
                Your list is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the heart on any product to save it for a later shop.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <label className="mt-1 flex shrink-0 items-start">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(event) =>
                        onSelectedChange(item.product_id, event.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-border text-vm-primary focus:ring-vm-primary"
                      aria-label={`Select ${item.name}`}
                    />
                  </label>

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
                          onClick={() =>
                            onQuantityChange(item.product_id, item.quantity - 1)
                          }
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
                          onClick={() =>
                            onQuantityChange(item.product_id, item.quantity + 1)
                          }
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
                        aria-label={`Remove ${item.name} from grocery list`}
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
            <button
              type="button"
              onClick={() => {
                const next = !allSelected;
                items.forEach((item) => onSelectedChange(item.product_id, next));
              }}
              className="mb-3 text-sm font-semibold text-vm-primary hover:text-vm-surface"
            >
              {allSelected ? "Clear selection" : "Select all"}
            </button>
          ) : null}

          <button
            type="button"
            disabled={selected.length === 0}
            onClick={onAddSelectedToCart}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-vm-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {selected.length === 0
              ? "Select items to add"
              : `Add ${selectedCount} to cart`}
          </button>
        </div>
      </aside>
    </div>
  );

  if (!mounted) return null;
  return createPortal(drawer, document.body);
}
