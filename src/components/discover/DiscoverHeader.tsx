import Image from "next/image";
import { heading1 } from "@/lib/ui-classes";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";

const DISCOVER_HERO_IMAGE = "/discover/whats-happening-hero.png";

export function DiscoverHeader({ stockup = false }: { stockup?: boolean }) {
  if (stockup) {
    return (
      <section className="bg-[#064E3B]">
        <div className="mx-auto flex min-h-[8.5rem] max-w-[1200px] items-center px-4 sm:min-h-[9.5rem] sm:px-6 lg:px-8">
          <h1 className="text-[2.625rem] font-bold leading-[1.08] tracking-tight text-white sm:text-[2.75rem] lg:text-[3rem]">
            News & Savings
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f5f2ff]">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden">
        <div className="relative aspect-[2700/378] min-h-[8.5rem] w-full sm:min-h-[9.5rem]">
          <Image
            src={DISCOVER_HERO_IMAGE}
            alt="FoodVault partner products and Piggy in a trolley"
            fill
            priority
            className="object-cover object-[right_center]"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
        <h1
          className={`${heading1} absolute inset-y-0 left-0 z-10 flex items-center px-4 pr-[clamp(8rem,36vw,16rem)] text-left sm:px-6 lg:px-8 ${
            stockup ? "text-white" : "text-black"
          }`}
        >
          {stockup ? "News & Savings" : DISCOVER_PAGE_TITLE}
        </h1>
      </div>
    </section>
  );
}
