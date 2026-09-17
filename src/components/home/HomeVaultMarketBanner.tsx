import Image from "next/image";
import Link from "next/link";

const HOME_BANNER_SRC = "/vault market/home_vaultmarket.png";

const PILLARS = [
  {
    title: "One Combined Box",
    body: "Everything packed and delivered together in a single shipment.",
  },
  {
    title: "Direct Warehouse Fulfillment",
    body: "Picked and shipped directly from our Auckland warehouse.",
  },
  {
    title: "Exclusive Member Pricing",
    body: "Unlocked automatically for active FoodVault members.",
  },
] as const;

export function HomeVaultMarketBanner({
  compactSpacing = false,
}: {
  compactSpacing?: boolean;
}) {
  return (
    <section className={compactSpacing ? "py-8 sm:py-10" : "py-10 sm:py-14"}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-[#064E3B] text-white shadow-sm">
          <div className="relative min-h-[280px] sm:min-h-[420px]">
            <div className="absolute inset-0 z-0">
              <Image
                src={HOME_BANNER_SRC}
                alt=""
                fill
                sizes="100vw"
                className="h-full w-full object-contain md:object-right"
              />
            </div>

            <div className="relative z-10 flex min-h-[280px] flex-col justify-center bg-gradient-to-r from-[#064E3B] via-[#064E3B]/90 to-transparent px-6 py-8 sm:min-h-[420px] sm:px-10 sm:py-10 md:max-w-[52%]">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Vault Market is Live
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-50 sm:text-base">
                Direct savings on everyday items, packed and shipped straight from our
                central Auckland facility.
              </p>
              <div className="mt-6">
                <Link
                  href="/pantry"
                  className="inline-flex h-11 items-center justify-center rounded-sm bg-[#10B981] px-5 text-sm font-bold text-white transition-colors hover:bg-[#34d399]"
                >
                  Shop Vault Market
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 px-6 pb-8 pt-2 sm:px-10 sm:pb-10 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-white/15 bg-black/25 px-4 py-4"
              >
                <p className="text-sm font-bold text-white">{pillar.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-emerald-50">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
