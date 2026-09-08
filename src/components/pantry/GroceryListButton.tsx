"use client";

import { Heart } from "lucide-react";
import { emitGroceryListOpen } from "@/lib/commerce/grocery-list";
import { useVaultMarketGroceryCount } from "@/lib/commerce/use-vault-market-grocery";

export function GroceryListButton({
  variant = "chrome",
}: {
  variant?: "chrome" | "nav";
}) {
  const { count, ready } = useVaultMarketGroceryCount();

  return (
    <button
      type="button"
      onClick={emitGroceryListOpen}
      aria-label={ready ? `Open grocery list, ${count} items` : "Open grocery list"}
      className={
        variant === "nav"
          ? "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          : "relative inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
      }
    >
      <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
      {variant === "chrome" ? (
        <span className="hidden sm:inline">
          {ready ? `List · ${count}` : "My List"}
        </span>
      ) : null}
      {ready && count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
