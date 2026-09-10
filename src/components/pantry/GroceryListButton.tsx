"use client";

import { Heart } from "lucide-react";
import { emitGroceryListOpen } from "@/lib/commerce/grocery-list";
import { useVaultMarketGroceryCount } from "@/lib/commerce/use-vault-market-grocery";

export function GroceryListButton({
  variant = "chrome",
  menuPreview = false,
}: {
  variant?: "chrome" | "nav";
  menuPreview?: boolean;
}) {
  const { count, ready } = useVaultMarketGroceryCount();
  const navOnChrome = variant === "nav" && menuPreview;

  return (
    <button
      type="button"
      onClick={emitGroceryListOpen}
      aria-label={ready ? `Open grocery list, ${count} items` : "Open grocery list"}
      className={
        variant === "nav"
          ? navOnChrome
            ? "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            : "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          : "relative inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-vm-primary hover:text-vm-primary"
      }
    >
      <Heart
        className={`h-4 w-4 ${
          variant === "nav" ? (navOnChrome ? "text-white" : "text-primary") : "text-vm-primary"
        }`}
        aria-hidden="true"
      />
      {variant === "chrome" ? (
        <span className="hidden sm:inline">
          {ready ? `List · ${count}` : "My List"}
        </span>
      ) : null}
      {ready && count > 0 ? (
        <span
          className={`absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-4 ${
            variant === "nav"
              ? navOnChrome
                ? "bg-[#064E3B] text-white"
                : "bg-primary text-primary-foreground"
              : "bg-vm-primary text-white"
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
