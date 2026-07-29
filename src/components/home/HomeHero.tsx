import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import {
  HOME_HERO_PY_COMPACT,
  HOME_HERO_PY_ACTIVE_MEMBER,
  HOME_HERO_PY_FREE_TRIAL,
  HOME_HERO_PY_PARTNER,
} from "@/components/home/section-spacing";

const VISITOR_HERO_BACKGROUND = "/home/hero-visitor-background.webp";
const VISITOR_HERO_ILLUSTRATION = "/home/kiwi_piggy_hp.webp";

type HomeHeroProps = {
  isActiveMember?: boolean;
  isFreeTrial?: boolean;
  isPartner?: boolean;
  memberName?: string | null;
};

export function HomeHero({
  isActiveMember = false,
  isFreeTrial = false,
  isPartner = false,
  memberName = null,
}: HomeHeroProps) {
  const isCompactHero = isPartner || isActiveMember || isFreeTrial;
  const isVisitorHero = !isCompactHero;

  const compactHeroPadding = isActiveMember
    ? HOME_HERO_PY_ACTIVE_MEMBER
    : isPartner
      ? HOME_HERO_PY_PARTNER
      : HOME_HERO_PY_FREE_TRIAL;

  return (
    <section
      className={`relative overflow-hidden border-b ${
        isVisitorHero
          ? "border-white/15 bg-primary"
          : isActiveMember
            ? "border-border bg-[#EEF2FF]"
            : "border-border bg-background"
      }`}
    >
      {isVisitorHero ? (
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
      ) : null}
      {isVisitorHero ? (
        <VisitorHeroBanner />
      ) : (
        <div
          className={`relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 ${compactHeroPadding}`}
        >
          <CompactHeroWelcome memberName={memberName} />
        </div>
      )}
    </section>
  );
}

function CompactHeroWelcome({ memberName }: { memberName: string | null }) {
  return (
    <h1 className="text-[22px] font-bold leading-snug tracking-tight text-foreground">
      Welcome back
      {memberName ? (
        <>
          , <span className="text-primary">{memberName}</span>.
        </>
      ) : (
        "."
      )}
    </h1>
  );
}

function VisitorHeroBanner() {
  return (
    <div className="relative z-10 mx-auto max-w-[1200px]">
      <div className="grid min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,46%)] md:items-stretch">
        <div
          className={`flex min-w-0 flex-col justify-center px-4 sm:px-6 lg:px-8 ${HOME_HERO_PY_COMPACT}`}
        >
          <h1 className="text-[2.625rem] font-bold leading-[1.08] tracking-tight text-white sm:text-[2.75rem] lg:text-[3rem]">
            Discover Kiwi Brands.{" "}
            <span className="text-white/95">Enjoy Member Savings.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            FoodVault exists for one reason: to help you spend less on the products you love. We
            connect you directly with Kiwi brands offering exclusive member pricing, helping you save
            more on the things you love!
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MemberSignupCtaLink
              variant="start-free-trial"
              className="inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-3 text-sm font-semibold text-primary shadow-card transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:bg-white/95 sm:w-auto"
            />
            <Link
              href="/browse-brands"
              className="inline-flex w-full items-center justify-center rounded-sm border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
            >
              Explore Brands
            </Link>
          </div>
        </div>

        <div className="relative m-0 flex min-h-0 items-stretch justify-end self-stretch p-0 leading-[0]">
          <img
            src={VISITOR_HERO_ILLUSTRATION}
            alt=""
            aria-hidden="true"
            className="block h-auto w-full max-w-full object-contain px-4 pb-4 pt-2 sm:px-6 md:h-full md:min-h-0 md:w-auto md:max-h-full md:max-w-full md:px-0 md:pb-0 md:pt-0 md:object-contain md:object-right"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
