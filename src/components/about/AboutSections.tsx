import Image from "next/image";
import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";

const VISITOR_HERO_BACKGROUND = "/home/hero-visitor-background.webp";
const ABOUT_HERO_IMAGE = "/about/about-hero-bg.webp";

const HERO_PRIMARY_CTA_CLASS =
  "inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-3 text-sm font-semibold text-primary shadow-card transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:bg-white/95 sm:w-auto";

const ABOUT_HERO_TEXT_PY = "py-[1.02rem] sm:py-[1.36rem] lg:py-[1.7rem]";
const ABOUT_HERO_GRID_MIN_H = "md:min-h-[19.04rem] lg:min-h-[21.76rem]";
const ABOUT_HERO_IMAGE_H = "min-h-[min(48.96vw,12.24rem)]";
const ABOUT_HERO_IMAGE_MAX_H = "max-h-[min(48.96vw,12.24rem)]";

export function AboutHero() {
  return (
    <section className="relative flex flex-col overflow-hidden border-b border-white/15 bg-primary">
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ isolation: "isolate" }}
      >
        <img
          src={VISITOR_HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
          style={{ imageRendering: "-webkit-optimize-contrast" }}
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        <div
          className={`grid min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,46%)] md:items-stretch ${ABOUT_HERO_GRID_MIN_H}`}
        >
          <div className={`flex flex-col justify-center px-4 sm:px-6 lg:px-8 ${ABOUT_HERO_TEXT_PY}`}>
            <h1 className="text-[2.625rem] font-bold leading-[1.08] tracking-tight text-white sm:text-[2.75rem] lg:text-[3rem]">
              Discover More. <span className="text-white/95">Pay Less.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              Your membership unlocks exclusive savings from Kiwi brands, local businesses and
              places worth discovering.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MemberSignupCtaLink variant="unlock-discounts" className={HERO_PRIMARY_CTA_CLASS} />
              <Link
                href="/browse-brands"
                className="inline-flex w-full items-center justify-center rounded-sm border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
              >
                Browse Listings
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-0 w-full items-center justify-center self-stretch px-4 pb-4 sm:px-6 md:px-8 md:pb-0">
            <div className="w-full md:hidden">
              <div className={`flex ${ABOUT_HERO_IMAGE_H} w-full items-center justify-center`}>
                <img
                  src={ABOUT_HERO_IMAGE}
                  alt="Kiwi brand products and local favourites"
                  className={`block h-auto w-full ${ABOUT_HERO_IMAGE_MAX_H} object-contain object-center`}
                  decoding="async"
                />
              </div>
            </div>
            <img
              src={ABOUT_HERO_IMAGE}
              alt=""
              aria-hidden="true"
              className="hidden h-auto max-h-full w-full max-w-[min(100%,40rem)] object-contain object-center md:block md:w-auto md:max-w-full"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutValueSplitSection() {
  return (
    <section className={`bg-background ${SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Why FoodVault
        </h2>
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8">
          <article className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              For Members
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Discover amazing Kiwi brands and local hospitality venues, unlock exclusive member
              savings, and save with confidence. Whether you&apos;re shopping online for everyday
              essentials or grabbing lunch at a local cafe, FoodVault helps you get more value
              every day.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              For Businesses
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              FoodVault helps more people discover your business—whether you sell online or run a
              local cafe, restaurant, bakery, or deli. Create your free profile, showcase your
              offers, and connect directly with members actively looking for places like yours.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function AboutFounderSection() {
  return (
    <section
      id="meet-the-founder"
      className={`scroll-mt-24 border-y border-border bg-surface ${SECTION_PY_HOME_REFINE}`}
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-8">
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-sm ring-1 ring-border lg:mx-0 lg:max-w-none">
          <Image
            src="/about/founder-mark.png"
            alt="Mark Coulston, founder of FoodVault"
            width={1080}
            height={1350}
            className="h-auto w-full object-cover"
            sizes="(max-width: 1024px) 90vw, 480px"
            unoptimized
            priority={false}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Meet the Founder
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p className="font-medium text-foreground">Hi, I&apos;m Mark Coulston.</p>
            <p>
              Having owned a Four Square (Foodstuffs North Island) and built wholesale
              distribution across two continents, I&apos;ve seen the retail and hospitality game
              from every angle—from early pitch meetings landing first shelf spots to running
              daily store operations.
            </p>
            <p>
              If there&apos;s one thing I know, it&apos;s that building a brand or running a venue
              takes serious time and grit. New Zealand is a tough market with tight margins, and
              building a loyal base of everyday supporters is the real foundation of any lasting
              business.
            </p>
            <p>
              That&apos;s why I built FoodVault: to give Kiwi brands and local hospitality venues
              a direct connection to loyal customers, while giving Kiwi families genuine savings
              on the things they love.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
