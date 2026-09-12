import Image from "next/image";
import Link from "next/link";

const HOME_BANNER_SRC = "/vault market/pantry_banner.png";

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
        <div className="relative overflow-hidden rounded-2xl bg-[#064E3B] text-white shadow-sm">
          <div className="relative md:flex md:min-h-[22rem] md:items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 items-center overflow-hidden md:flex">
              <Image
                src={HOME_BANNER_SRC}
                alt=""
                width={2414}
                height={457}
                sizes="80vw"
                className="h-[21rem] w-auto max-w-none -translate-x-[32.3%] object-contain object-left"
              />
            </div>

            <div className="relative z-10 ml-auto px-6 pt-8 sm:px-10 sm:pt-10 md:w-1/2 md:py-10">
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
                  className="inline-flex h-11 items-center justify-center rounded-sm bg-[#A3E635] px-5 text-sm font-bold text-[#064E3B] transition-colors hover:bg-[#bef264]"
                >
                  Shop Vault Market
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full px-4 pt-6 md:hidden">
            <Image
              src={HOME_BANNER_SRC}
              alt=""
              width={2414}
              height={457}
              sizes="100vw"
              className="h-auto w-full object-contain object-center"
            />
          </div>

          <div className="relative z-10 mt-6 grid gap-3 px-6 pb-8 sm:grid-cols-3 sm:px-10 sm:pb-10">
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
