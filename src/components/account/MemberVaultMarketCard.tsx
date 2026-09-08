import Link from "next/link";
import { formatNzPrice } from "@/lib/partner-offer";

export function MemberVaultMarketCard({ lifetimeSavings }: { lifetimeSavings: number }) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Vault Market</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">Your pantry savings</h2>
          <p className="mt-3 text-3xl font-bold text-success">{formatNzPrice(lifetimeSavings)}</p>
          <p className="mt-1 text-sm text-muted">
            Accrued member savings across completed Vault Market orders.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-[11rem]">
          <Link
            href="/pantry"
            className="fv-btn-primary inline-flex h-11 items-center justify-center rounded-sm px-4 text-sm font-semibold text-primary-foreground"
          >
            Shop Pantry
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex h-11 items-center justify-center rounded-sm border border-border px-4 text-sm font-semibold text-foreground hover:bg-surface"
          >
            Past Orders
          </Link>
        </div>
      </div>
    </section>
  );
}
