import Image from "next/image";

const PANTRY_BANNER_SRC = "/vault market/pantry_banner.png";

export function PantryHeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#064E3B] text-white">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] md:block">
        <Image
          src={PANTRY_BANNER_SRC}
          alt=""
          fill
          sizes="(max-width: 768px) 0px, 52vw"
          className="object-contain object-right-bottom"
          priority
        />
      </div>

      <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8 md:max-w-[50%]">
        <p className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Real member savings on everyday items.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
          Great deals now. More stock as we grow.
        </p>
      </div>

      <div className="relative mx-auto w-full px-4 pb-5 md:hidden">
        <Image
          src={PANTRY_BANNER_SRC}
          alt=""
          width={2414}
          height={457}
          sizes="100vw"
          className="h-auto w-full object-contain object-bottom"
        />
      </div>
    </div>
  );
}
