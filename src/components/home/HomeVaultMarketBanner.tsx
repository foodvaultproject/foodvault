import Image from "next/image";
import Link from "next/link";

const HOME_BANNER_SRC = "/vault market/home_vaultmarket.png";
const HOME_BANNER_WIDTH = 2555;
const HOME_BANNER_HEIGHT = 956;

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
        <div className="rounded-2xl bg-[#064E3B] px-6 py-8 text-white shadow-sm sm:px-10 sm:py-10">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="w-full min-w-0 md:w-1/2">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Vault Market is Live
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-50 sm:text-base">
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

            <div className="flex h-[200px] w-full items-center justify-end overflow-hidden md:h-[320px] md:w-1/2">
              <Image
                src={HOME_BANNER_SRC}
                alt="Vault Market box with member pantry staples"
                width={HOME_BANNER_WIDTH}
                height={HOME_BANNER_HEIGHT}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-auto max-h-[320px] max-w-none object-contain object-right"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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
