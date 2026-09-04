import Image from "next/image";
import { heading1 } from "@/lib/ui-classes";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";

const DISCOVER_HERO_IMAGE = "/discover/whats-happening-hero.png";

export function DiscoverHeader() {
  return (
    <section className="bg-black">
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
          className={`${heading1} absolute inset-y-0 left-0 z-10 flex items-center px-4 pr-[clamp(8rem,36vw,16rem)] text-left text-white sm:px-6 lg:px-8`}
        >
          {DISCOVER_PAGE_TITLE}
        </h1>
      </div>
    </section>
  );
}
