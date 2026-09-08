import Link from "next/link";

export function HomeVaultMarketBanner({
  compactSpacing = false,
}: {
  compactSpacing?: boolean;
}) {
  return (
    <section className={compactSpacing ? "py-8 sm:py-10" : "py-10 sm:py-14"}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-primary px-6 py-8 text-primary-foreground shadow-sm sm:px-10 sm:py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/80">
            Vault Market
          </p>
          <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
            Vault Market: Direct-to-Member Wholesale Pantry
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
            Zero retail markups on ambient staples, organics, and household essentials. Exclusive to FoodVault members.
          </p>
          <Link
            href="/pantry"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-sm bg-white px-5 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
          >
            Browse Vault Market
          </Link>
        </div>
      </div>
    </section>
  );
}
