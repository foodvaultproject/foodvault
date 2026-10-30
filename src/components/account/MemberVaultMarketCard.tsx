import Link from "next/link";
import { formatNzPrice } from "@/lib/partner-offer";

export function MemberVaultMarketCard({
  lifetimeSavings,
  stockup = false,
}: {
  lifetimeSavings: number;
  stockup?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl bg-white p-5 shadow-sm ${
        stockup ? "border border-vm-primary/30" : "border border-primary/20"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className={`text-[11px] font-bold uppercase tracking-wide ${
              stockup ? "text-vm-primary" : "text-primary"
            }`}
          >
            {stockup ? "StockUp" : "Vault Market"}
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            {stockup ? "Your StockUp savings" : "Your pantry savings"}
          </h2>
          <p className="mt-3 text-3xl font-bold text-success">{formatNzPrice(lifetimeSavings)}</p>
          <p className="mt-1 text-sm text-muted">
            {stockup
              ? "Savings across completed StockUp orders."
              : "Accrued member savings across completed Vault Market orders."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-[11rem]">
          <Link
            href="/"
            className={
              stockup
                ? "inline-flex h-11 items-center justify-center rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white hover:bg-[#059669]"
                : "fv-btn-primary inline-flex h-11 items-center justify-center rounded-sm px-4 text-sm font-semibold text-primary-foreground"
            }
          >
            {stockup ? "Shop StockUp" : "Shop Pantry"}
          </Link>
          <Link
            href={stockup ? "/account/history" : "/account/orders"}
            className="inline-flex h-11 items-center justify-center rounded-sm border border-border px-4 text-sm font-semibold text-foreground hover:bg-surface"
          >
            Past Orders
          </Link>
        </div>
      </div>
    </section>
  );
}
