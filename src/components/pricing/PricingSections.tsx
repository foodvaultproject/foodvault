import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import {
  formatMembershipPrice,
  type MembershipSettings,
} from "@/lib/member/pricing";
import { PartnerJoinCTA } from "@/components/partners/PartnerJoinCTA";
import { heading1, heading2OnDark } from "@/lib/ui-classes";

const membershipFeatures = [
  "Unlimited access",
  "All categories",
  "Favourite brands",
  "Shop smarter. Start saving",
  "Cancel anytime",
];

const trustIndicators = [
  { label: "Secure Payments", icon: "🔒" },
  { label: "Cancel Anytime", icon: "✓" },
  { label: "Data Protected", icon: "🛡️" },
];

export function PricingHero({ settings }: { settings: MembershipSettings }) {
  const formattedPrice = formatMembershipPrice(settings.membershipPriceMonthly);

  return (
    <section className="bg-gradient-to-b from-surface-lavender via-background to-background py-7 sm:py-10 md:py-12 lg:py-14">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-success-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-success">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Unbeatable Value
        </span>

        <h1 className={`mt-6 ${heading1}`}>
          Simple, Transparent Membership
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
          Save money on the food you actually buy. Unlock exclusive member pricing
          from a growing network of New Zealand food, beverage and household brands — and shop
          directly with the brands you trust.
        </p>

        <div className="mx-auto mt-10 max-w-md rounded-lg border border-border bg-background p-6 text-left shadow-lg sm:mt-12 sm:p-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            FoodVault Membership
          </p>
          <p className="mt-4 text-center">
            <span className="text-5xl font-bold text-primary sm:text-6xl">{formattedPrice}</span>
            <span className="text-lg text-muted-foreground"> / month</span>
          </p>

          <ul className="mt-8 space-y-3">
            {membershipFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-foreground sm:text-base">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3">
            <Link
              href="/signup"
              className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
            >
              Start Membership
            </Link>
            <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              or
            </p>
            <MemberSignupCtaLink
              variant="start-free-trial"
              className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
            />
            <p className="text-center text-xs text-muted-foreground">
              {settings.trialLengthDays}-day free trial · No payment card required
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-8">
          {trustIndicators.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingFinalCTA() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-sm bg-primary px-6 py-10 sm:flex-row sm:gap-8 sm:px-8 sm:py-12 md:px-10 md:py-12 lg:px-12 lg:py-14">
          <div className="text-center sm:text-left">
            <h2 className={heading2OnDark}>
              Spend less. Save more.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/80 sm:mt-4 sm:text-base">
              Join FoodVault and unlock exclusive member pricing from
              participating New Zealand brands—all in one place.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
          >
            Start Membership Now
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PricingPartnerCTA() {
  return (
    <PartnerJoinCTA
      className="bg-surface-lavender pb-5 pt-3 sm:pb-7 sm:pt-4 lg:pt-5"
      compact
      showTrustPoints={false}
      showHighlights={false}
      title="Own a Kiwi Brand?"
    />
  );
}
