import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { OwnAKiwiBrandCard } from "@/components/partners/OwnAKiwiBrandCard";
import {
  formatMembershipPrice,
  type MembershipSettings,
} from "@/lib/member/pricing";
import { heading1, heading2, heading2OnDark } from "@/lib/ui-classes";

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
        <h1 className={heading1}>
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

export function PricingDualCTASection() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <article className="relative flex h-full flex-col overflow-hidden rounded-2xl p-6 shadow-lg sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/pricing/spend_less_bg.png')" }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex h-full flex-col">
              <h2 className={heading2OnDark}>Spend less. Save more.</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/85 sm:mt-4 sm:text-base">
                Join FoodVault and unlock exclusive member pricing from participating New Zealand
                brands—all in one place.
              </p>
              <div className="mt-auto pt-6 sm:pt-8">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
                >
                  Start Membership Now
                </Link>
              </div>
            </div>
          </article>

          <OwnAKiwiBrandCard />
        </div>
      </div>
    </section>
  );
}
