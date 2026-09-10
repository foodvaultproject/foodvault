"use client";

import { ShoppingBag } from "lucide-react";
import { emitVaultMarketCartOpen } from "@/lib/commerce/cart";
import { useVaultMarketCartCount } from "@/lib/commerce/use-vault-market-cart";

export function VaultMarketCartButton({
  variant = "page",
  menuPreview = false,
}: {
  variant?: "page" | "nav";
  menuPreview?: boolean;
}) {
  const { count, ready } = useVaultMarketCartCount();

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={emitVaultMarketCartOpen}
        aria-label={ready ? `Open cart, ${count} items` : "Open cart"}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          menuPreview
            ? "text-white hover:bg-white/10"
            : "text-foreground hover:bg-primary/10 hover:text-primary"
        }`}
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        {ready && count > 0 ? (
          <span className={`absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-4 ${
            menuPreview ? "bg-[#064E3B] text-white" : "bg-primary text-primary-foreground"
          }`}>
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={emitVaultMarketCartOpen}
      aria-label={ready ? `Open cart, ${count} items` : "Open cart"}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-vm-primary hover:text-vm-primary"
    >
      <span className="relative">
        <ShoppingBag className="h-4 w-4 text-vm-primary" aria-hidden="true" />
        {ready && count > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-vm-primary px-1 text-[10px] font-bold leading-4 text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      {ready ? `Cart · ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
    </button>
  );
}
