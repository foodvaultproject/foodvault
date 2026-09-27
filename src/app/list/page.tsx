"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CONSUMER_VAULT_MARKET_PATH } from "@/lib/consumer-nav-restructure";
import { requestGroceryListOpen } from "@/lib/commerce/grocery-list";

export default function GroceryListPage() {
  useEffect(() => {
    requestGroceryListOpen();
  }, []);

  return (
    <section className="bg-page">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wide text-vm-primary">FoodVault</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">My Grocery List</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Your saved supermarket staples open here. Add them to your cart when you are ready to check out at member price.
        </p>
        <Link
          href={CONSUMER_VAULT_MARKET_PATH}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white hover:bg-vm-surface"
        >
          Shop Supermarket
        </Link>
      </div>
    </section>
  );
}
