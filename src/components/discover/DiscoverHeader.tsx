import { heading1 } from "@/lib/ui-classes";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";

const DISCOVER_HERO_BG = "#EEF2FF";
const DISCOVER_HERO_IMAGE = "/discover/whats-happening-hero.png";

export function DiscoverHeader() {
  return (
    <section className="bg-[#EEF2FF]">
      <div
        className="mx-auto flex min-h-[7.5rem] max-w-[1200px] items-center bg-[length:clamp(6.5rem,24vw,11.5rem)_auto] bg-[position:calc(100%-0.75rem)_50%] bg-no-repeat px-4 py-7 sm:min-h-[9rem] sm:bg-[length:clamp(7.5rem,22vw,12rem)_auto] sm:bg-[position:calc(100%-1.5rem)_50%] sm:px-6 sm:py-9 lg:min-h-[10.5rem] lg:bg-[position:calc(100%-2rem)_50%] lg:px-8 lg:py-10"
        style={{
          backgroundColor: DISCOVER_HERO_BG,
          backgroundImage: `url("${DISCOVER_HERO_IMAGE}")`,
        }}
      >
        <h1
          className={`${heading1} max-w-none pr-[clamp(7rem,28vw,13rem)] text-left`}
        >
          {DISCOVER_PAGE_TITLE}
        </h1>
      </div>
    </section>
  );
}
