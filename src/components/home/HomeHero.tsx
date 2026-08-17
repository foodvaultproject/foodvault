import type { ReactNode } from "react";
import Link from "next/link";
import { HomeHeroGalleryCollage } from "@/components/home/HomeHeroGalleryCollage";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { consumerSearchPath } from "@/lib/consumer-nav-restructure";
import { HOME_HERO_PY_COMPACT } from "@/components/home/section-spacing";

const VISITOR_HERO_BACKGROUND = "/home/hero-visitor-background.webp";
const VISITOR_HERO_ILLUSTRATION = "/home/kiwi_piggy_hp.webp";
const ACTIVE_MEMBER_HERO_ILLUSTRATION = "/home hero active member/piggy_active_hero.webp";

const HERO_PRIMARY_CTA_CLASS =
  "inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-3 text-sm font-semibold text-primary shadow-card transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:bg-white/95 sm:w-auto";

const VISITOR_SUPPORTING_COPY =
  "Explore Kiwi brands, discover something new and save with exclusive member discounts. Find new favourites and keep more money in your pocket along the way!";

export type HomeHeroVariant = "visitor" | "active-member" | "partner";

type HomeHeroProps = {
  variant?: HomeHeroVariant;
  collageImages?: string[];
  hospitality?: boolean;
};

export function HomeHero({
  variant = "visitor",
  collageImages = [],
  hospitality = false,
}: HomeHeroProps) {
  return (
    <section className="relative flex flex-col overflow-hidden border-b border-white/15 bg-primary">
      <HeroBackground />
      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        {variant === "visitor" ? <VisitorHeroBanner /> : null}
        {variant === "active-member" ? <ActiveMemberHeroBanner /> : null}
        {variant === "partner" ? (
          <SignedInHeroBanner
            title={
              hospitality ? (
                <>
                  Turn local foot traffic into{" "}
                  <span className="text-white/95">loyal regulars!</span>
                </>
              ) : (
                <>
                  Turn discovery into <span className="text-white/95">direct sales!</span>
                </>
              )
            }
            description={
              hospitality
                ? "Get your venue discovered by more Kiwis, showcase your menu, and drive local customers through your doors to dine with you."
                : "Get your brand discovered by more Kiwis, showcase your products and send customers directly to your website to buy from you."
            }
            cta={
              <Link href="/partner/listing" className={HERO_PRIMARY_CTA_CLASS}>
                Manage My Listing
              </Link>
            }
            visual={<HomeHeroGalleryCollage images={collageImages} variant="partner" />}
            compact
          />
        ) : null}
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
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
  );
}

function HeroTextColumn({
  title,
  description,
  actions,
  paddingClass = HOME_HERO_PY_COMPACT,
}: {
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  paddingClass?: string;
}) {
  return (
    <div className={`flex flex-col justify-center px-4 sm:px-6 lg:px-8 ${paddingClass}`}>
      <h1 className="text-[2.625rem] font-bold leading-[1.08] tracking-tight text-white sm:text-[2.75rem] lg:text-[3rem]">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
        {description}
      </p>
      {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}
    </div>
  );
}

function HeroVisualColumn({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-auto flex min-h-0 items-end justify-center self-stretch leading-[0] px-4 pb-4 sm:px-6 md:mt-0 md:overflow-visible md:px-8 md:pb-0">
      {children}
    </div>
  );
}

function HeroGrid({
  text,
  visual,
  compact = false,
}: {
  text: ReactNode;
  visual: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`grid min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,46%)] md:items-stretch ${
        compact ? "md:min-h-[17rem] lg:min-h-[19rem]" : "md:min-h-[28rem] lg:min-h-[32rem]"
      }`}
    >
      {text}
      {visual}
    </div>
  );
}

function HeroIllustration({
  src,
  compact = false,
}: {
  src: string;
  compact?: boolean;
}) {
  return (
    <div className="relative mt-auto flex min-h-0 w-full items-end justify-center self-stretch leading-[0] md:overflow-visible md:px-8">
      <div className="w-full px-4 sm:px-6 md:hidden">
        <div
          className={
            compact
              ? "flex min-h-[min(50.4vw,12.6rem)] w-full items-end justify-center"
              : "flex min-h-[min(72vw,18rem)] w-full items-end justify-center"
          }
        >
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className={
              compact
                ? "block h-auto w-full max-h-[min(50.4vw,12.6rem)] object-contain object-bottom"
                : "block h-auto w-full max-h-[min(72vw,18rem)] object-contain object-bottom"
            }
            decoding="async"
          />
        </div>
      </div>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={
          compact
            ? "hidden h-auto w-full max-w-[min(100%,28rem)] object-contain object-bottom md:block md:max-h-full md:w-auto md:max-w-full md:origin-bottom md:scale-[0.91] md:-translate-x-2"
            : "hidden h-auto w-full max-w-[min(100%,40rem)] object-contain object-bottom md:block md:max-h-full md:w-auto md:max-w-full md:origin-bottom md:scale-[1.3] md:-translate-x-2"
        }
        decoding="async"
      />
    </div>
  );
}

function VisitorHeroBanner() {
  return (
    <div className="grid min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,46%)] md:min-h-[28rem] md:items-stretch lg:min-h-[32rem]">
      <HeroTextColumn
        title={
          <>
            Discover Kiwi Brands.{" "}
            <span className="text-white/95">Enjoy Member Savings.</span>
          </>
        }
        description={VISITOR_SUPPORTING_COPY}
        actions={
          <>
            <MemberSignupCtaLink variant="unlock-discounts" className={HERO_PRIMARY_CTA_CLASS} />
            <Link
              href={consumerSearchPath()}
              className="inline-flex w-full items-center justify-center rounded-sm border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
            >
              Explore Brands
            </Link>
          </>
        }
      />
      <HeroIllustration src={VISITOR_HERO_ILLUSTRATION} />
    </div>
  );
}

function ActiveMemberHeroBanner() {
  return (
    <div className="grid min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,46%)] md:min-h-[19.6rem] md:items-stretch lg:min-h-[22.4rem]">
      <HeroTextColumn
        paddingClass="py-[1.05rem] sm:py-[1.4rem] lg:py-[1.75rem]"
        title={
          <>
            More to discover. <span className="text-white/95">More to save.</span>
          </>
        }
        description="Your FoodVault membership unlocks exclusive discounts from Kiwi brands. Discover something new, find your next favourite and save along the way."
        actions={
          <Link href={consumerSearchPath()} className={HERO_PRIMARY_CTA_CLASS}>
            Start Search
          </Link>
        }
      />
      <HeroIllustration src={ACTIVE_MEMBER_HERO_ILLUSTRATION} compact />
    </div>
  );
}

function SignedInHeroBanner({
  title,
  description,
  visual,
  cta,
  compact = false,
}: {
  title: ReactNode;
  description: string;
  visual: ReactNode;
  cta?: ReactNode;
  compact?: boolean;
}) {
  return (
    <HeroGrid
      compact={compact}
      text={<HeroTextColumn title={title} description={description} actions={cta} />}
      visual={<HeroVisualColumn>{visual}</HeroVisualColumn>}
    />
  );
}
