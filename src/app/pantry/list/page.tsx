"use client";

import { useEffect } from "react";
import Link from "next/link";
import { requestGroceryListOpen } from "@/lib/commerce/grocery-list";

export default function PantryGroceryListPage() {
  useEffect(() => {
    requestGroceryListOpen();
  }, []);

  return (
    <section className="bg-page">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wide text-vm-primary">Vault Market</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">My Grocery List</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Your saved pantry staples open here. Add them to your cart when you are ready to check out at member price.
        </p>
        <Link
          href="/pantry"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white hover:bg-vm-surface"
        >
          Browse Vault Market
        </Link>
      </div>
    </section>
  );
}
