import Link from "next/link";
import Image from "next/image";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { HomeTrendingSearches } from "@/components/home/HomeTrendingSearches";
import { HOME_HERO_PY_COMPACT, HOME_HERO_PY_PARTNER } from "@/components/home/section-spacing";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import type { PartnerLogoItem } from "@/lib/member/browse-brands";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";
import { DEFAULT_TRIAL_LENGTH_DAYS } from "@/lib/system-settings";

const VISITOR_HERO_BACKGROUND = "/home/hero-visitor-garlic-bread.jpg";

function visitorTrustIndicators(trialLengthDays: number) {
  return [
    {
      label:
        trialLengthDays === 1
          ? "1-Day Free Trial"
          : `${trialLengthDays}-Day Free Trial`,
    },
    { label: "Kiwi Owned" },
    { label: "Shop Directly With Brands" },
  ] as const;
}

const MEMBER_TRUST_INDICATORS = [
  { label: "Membership Active" },
  { label: "Kiwi Owned" },
  { label: "Shop Directly With Brands" },
] as const;

const PARTNER_TRUST_INDICATORS = [
  { label: "Partner Account Active" },
  { label: "Kiwi Owned" },
  { label: "Reach NZ Members" },
] as const;

/** ~8% inset — consistent logo margin inside the white circular frame. */
const HERO_LOGO_INSET = "inset-[8%]";

const COMPACT_HERO_PY = "py-3.5 sm:py-5 lg:py-6";
const PARTNER_HERO_PY = HOME_HERO_PY_PARTNER;
const COMPACT_HERO_GRID_GAP = "gap-5 lg:gap-7";
const COMPACT_LOGO_GRID_CLASS =
  "mx-auto hidden w-[32%] max-w-[9.6rem] lg:block";

type HeroEnterDirection = "top" | "left" | "right" | "bottom";

type HomeHeroProps = {
  partners: PartnerLogoItem[];
  isActiveMember?: boolean;
  isFreeTrial?: boolean;
  isPartner?: boolean;
  memberName?: string | null;
  trialLengthDays?: number;
};

export function HomeHero({
  partners,
  isActiveMember = false,
  isFreeTrial = false,
  isPartner = false,
  memberName = null,
  trialLengthDays = DEFAULT_TRIAL_LENGTH_DAYS,
}: HomeHeroProps) {
  const [partner1, partner2, partner3, partner4] = partners;
  const trustIndicators: readonly { label: string }[] = isPartner
    ? PARTNER_TRUST_INDICATORS
    : isActiveMember
      ? MEMBER_TRUST_INDICATORS
      : visitorTrustIndicators(trialLengthDays);
  const isCompactHero = isPartner || isActiveMember || isFreeTrial;
  const isVisitorHero = !isPartner && !isFreeTrial && !isActiveMember;
  // Trial and active members browse the embedded homepage explorer rather than
  // the standalone Discover page, so keep their category links on the homepage.
  const keepBrowseOnHomepage = isActiveMember || isFreeTrial;

  return (
    <section
      className={`relative overflow-hidden border-b border-border ${
        isActiveMember ? "bg-[#EEF2FF]" : "bg-background"
      }`}
    >
      {isVisitorHero ? (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <Image
            src={VISITOR_HERO_BACKGROUND}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
        </div>
      ) : null}
      <div
        className={
          isActiveMember
            ? "relative z-10 mx-auto max-w-[1200px] px-4 py-1.5 sm:px-6 sm:py-2 lg:px-8"
            : `relative z-10 mx-auto grid max-w-[1200px] items-center px-4 sm:px-6 lg:grid-cols-2 lg:px-8 ${
                isPartner
                  ? PARTNER_HERO_PY
                  : isFreeTrial
                    ? PARTNER_HERO_PY
                    : isCompactHero
                      ? COMPACT_HERO_PY
                      : HOME_HERO_PY_COMPACT
              } ${
                isPartner || isFreeTrial
                  ? "gap-2.5 lg:gap-3.5"
                  : isCompactHero
                    ? COMPACT_HERO_GRID_GAP
                    : "gap-8 lg:gap-12"
              }`
        }
      >
        <div>
          {isPartner ? (
            <>
              <h1 className="text-base font-bold leading-snug tracking-tight text-foreground">
                Welcome back to your FoodVault{" "}
                <span className="text-primary">Partner Portal.</span>
              </h1>
              <p className="mt-2.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
                Manage your brand profile, member offers and product listings — and
                discover new ways to connect with FoodVault members across New Zealand.
              </p>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Link
                  href="/partner/listing"
                  className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-5 py-2 text-sm font-medium text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 sm:w-auto"
                >
                  Partner Dashboard
                </Link>
              </div>
            </>
          ) : isFreeTrial ? (
            <>
              <h1 className="text-[22px] font-bold leading-snug tracking-tight text-foreground">
                Welcome Back
                {memberName ? (
                  <>
                    , <span className="text-primary">{memberName}</span>
                  </>
                ) : (
                  "!"
                )}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Unlock exclusive member discounts from participating New Zealand food,
                beverage, household and health brands — and buy direct on each partner&apos;s
                own website.
              </p>
              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <MemberSignupCtaLink
                  variant="start-free-trial"
                  className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-medium text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 sm:w-auto"
                />
              </div>
            </>
          ) : isActiveMember ? (
            <>
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
            </>
          ) : (
            <>
              <h1 className="text-[2.625rem] font-bold leading-[1.08] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3rem]">
                Discover Kiwi Brands.{" "}
                <span className="text-primary">Enjoy Member Savings.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-black sm:text-lg">
                FoodVault exists for one reason: to help you spend less on the products you love.
                We connect you directly with Kiwi brands offering exclusive member pricing, helping
                you save more on the things you love!
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <MemberSignupCtaLink
                  variant="start-free-trial"
                  className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-medium text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 sm:w-auto"
                />
                <Link
                  href="/browse-brands"
                  className="inline-flex w-full items-center justify-center rounded-sm border border-white bg-transparent px-6 py-3 text-sm font-medium text-primary transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
                >
                  Explore Brands
                </Link>
              </div>
            </>
          )}
          {isPartner ? (
            <ul className={`flex flex-wrap gap-x-5 gap-y-2 ${isCompactHero ? "mt-3" : "mt-5"}`}>
              {trustIndicators.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {!isActiveMember ? (
          <div
            className={
              isCompactHero
                ? COMPACT_LOGO_GRID_CLASS
                : "mx-auto hidden w-[64%] max-w-[19.2rem] lg:block"
            }
          >
            <div className={`grid grid-cols-2 ${isCompactHero ? "gap-1.5" : "gap-2.5"}`}>
              <div className={isCompactHero ? "space-y-1.5" : "space-y-2.5"}>
                <HeroPartnerFrame
                  partner={partner1}
                  priority
                  enterFrom="top"
                  delayMs={0}
                  compact={isCompactHero}
                />
                <HeroPartnerFrame
                  partner={partner3}
                  enterFrom="left"
                  delayMs={160}
                  compact={isCompactHero}
                />
              </div>
              <div className={isCompactHero ? "space-y-1.5 pt-2.5" : "space-y-2.5 pt-5"}>
                <HeroPartnerFrame
                  partner={partner2}
                  enterFrom="right"
                  delayMs={80}
                  compact={isCompactHero}
                />
                <HeroPartnerFrame
                  partner={partner4}
                  priority
                  enterFrom="bottom"
                  delayMs={240}
                  compact={isCompactHero}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {!isPartner && !isFreeTrial && !isActiveMember ? (
        <div className="relative z-10 border-t border-border bg-background">
          <div
            className={`mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 ${
              isActiveMember ? "py-1.5" : "py-2"
            }`}
          >
            <HomeTrendingSearches
              keepBrowseOnHomepage={keepBrowseOnHomepage}
              hideViewAll={keepBrowseOnHomepage}
              compact={isActiveMember}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function HeroPartnerFrame({
  partner,
  priority,
  enterFrom,
  delayMs,
  compact = false,
}: {
  partner?: PartnerLogoItem;
  priority?: boolean;
  enterFrom: HeroEnterDirection;
  delayMs: number;
  compact?: boolean;
}) {
  const enterClass = `fv-hero-logo-enter-${enterFrom}`;
  const frameClass =
    "relative block aspect-square overflow-hidden rounded-full border border-border bg-white shadow-card transition-[box-shadow,transform,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover";

  if (!partner) {
    return (
      <div
        className={`${frameClass} ${enterClass} bg-gradient-to-br from-primary/20 to-primary/5`}
        style={{ animationDelay: `${delayMs}ms` }}
      />
    );
  }

  const hasLogo = Boolean(partner.logoUrl || partner.logoOriginalUrl);
  const initial = partner.businessName.trim().charAt(0).toUpperCase() || "?";

  return (
    <Link
      href={partnerProfilePathFromSlug(partner.slug)}
      aria-label={partner.businessName}
      className={`${frameClass} ${enterClass}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {hasLogo ? (
        <div className={`absolute ${HERO_LOGO_INSET}`}>
          <PartnerLogo
            src={partner.logoUrl}
            originalSrc={partner.logoOriginalUrl}
            alt={`${partner.businessName} logo`}
            businessName={partner.businessName}
            size="hero"
            crop={partner.logoCrop}
            priority={priority}
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface">
          <span className={`font-bold text-primary ${compact ? "text-base" : "text-3xl"}`}>
            {initial}
          </span>
        </div>
      )}
    </Link>
  );
}
