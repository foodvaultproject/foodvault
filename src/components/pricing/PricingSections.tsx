import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import {
  formatMembershipPrice,
  type MembershipSettings,
} from "@/lib/member/pricing";
import { PartnerJoinCTA } from "@/components/partners/PartnerJoinCTA";
import { heading1, heading2, heading2OnDark, heading3 } from "@/lib/ui-classes";

const membershipFeatures = [
  "Unlimited access",
  "All categories",
  "Favourite brands",
  "Weekly new brands",
  "Member-only giveaways",
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

const whyJoinItems = [
  {
    title: "Exclusive Member Pricing",
    description:
      "Access wholesale and member-only rates from 900+ independent New Zealand brands — savings you won't find anywhere else.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    title: "Brand Discovery",
    description:
      "Find new independent food and beverage brands every week across every category you shop.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: "One Simple Membership",
    description:
      "One plan, one price, unlimited access. No tiers, no hidden fees, no complexity.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

export function PricingWhyJoinSection() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className={`text-center ${heading2}`}>
          Why Join FoodVault?
        </h2>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-10">
          {whyJoinItems.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                {item.icon}
              </div>
              <h3 className={`mt-5 ${heading3}`}>{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.description}
              </p>
            </div>
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
              Ready to start saving?
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/80 sm:mt-4 sm:text-base">
              Join thousands of New Zealand members saving on independent food
              and beverage brands every week.
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
    <PartnerJoinCTA className="bg-surface-lavender pb-10 pt-6 sm:pb-14 sm:pt-8 lg:pt-10" />
  );
}
