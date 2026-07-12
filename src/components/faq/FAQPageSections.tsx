import Link from "next/link";
import {
  formatFreeTrialLabel,
  formatMembershipPriceMonthly,
  type MembershipSettings,
} from "@/lib/member/pricing";

export function FAQHero({ settings }: { settings: MembershipSettings }) {
  const priceLabel = formatMembershipPriceMonthly(settings.membershipPriceMonthly);
  const trialLabel = formatFreeTrialLabel(settings.trialLengthDays);

  return (
    <section className="bg-gradient-to-b from-surface-lavender via-background to-background pb-4 pt-7 sm:pb-5 sm:pt-10 md:pt-12">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Help Centre
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
          Find answers about FOODVAULT memberships in New Zealand ({priceLabel}, {trialLabel}),
          partner listings, the Affiliate Program, and how the platform works.
        </p>
      </div>
    </section>
  );
}

export function FAQContactCTA() {
  return (
    <section className="bg-background py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-lg bg-navy p-6 sm:flex-row sm:gap-8 sm:p-8 md:p-10 lg:p-12">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Can&apos;t find your answer?
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/70 sm:text-base">
              Our support team is here to help you with any specific queries.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
