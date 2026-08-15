import { OwnAKiwiBrandCard } from "@/components/partners/OwnAKiwiBrandCard";
import { PricingMembershipCardCtas } from "@/components/pricing/PricingMembershipCardCtas";
import { PricingSpendLessCta } from "@/components/pricing/PricingSpendLessCta";
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
          Become a FoodVault member and unlock exclusive discounts from Kiwi brands across
          New Zealand. Discover something new, shop direct, and save.
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

          <PricingMembershipCardCtas trialLengthDays={settings.trialLengthDays} />
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
                <PricingSpendLessCta />
              </div>
            </div>
          </article>

          <OwnAKiwiBrandCard />
        </div>
      </div>
    </section>
  );
}
