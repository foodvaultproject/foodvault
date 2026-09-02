import Link from "next/link";
import { SavingsTicker } from "@/components/checkout/SavingsTicker";
import { MembershipCheckoutButton } from "@/components/signup/MembershipCheckoutButton";
import { SignupProgress } from "@/components/signup/SignupProgress";
import type { SavingsTickerImage } from "@/lib/homepage/hero-gallery-images";
import {
  formatMembershipPrice,
  formatMembershipPriceMonthly,
  type MembershipSettings,
} from "@/lib/member/pricing";

const DISCOUNT_RATE = 0.15;
const BASKET_ONE_SPEND = 100;
const BASKET_TWO_SPEND = 300;
const WAIVED_ACTIVATION_FEE = 15;

function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

function formatDollars(amount: number) {
  return `$${Math.abs(amount).toFixed(2)}`;
}

function formatSignedDollars(amount: number) {
  const formatted = formatDollars(amount);
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

export function MembershipReview({
  settings,
  tickerImages,
  cancelled = false,
}: {
  settings: MembershipSettings;
  tickerImages: SavingsTickerImage[];
  cancelled?: boolean;
}) {
  const price = settings.membershipPriceMonthly;
  const formatted = formatMembershipPrice(price);
  const formattedMonthly = formatMembershipPriceMonthly(price);

  const basketOneSave = roundCents(BASKET_ONE_SPEND * DISCOUNT_RATE);
  const basketTwoSave = roundCents(BASKET_TWO_SPEND * DISCOUNT_RATE);
  const orderOneProfit = roundCents(basketOneSave - price);
  const netMonthly = roundCents(basketOneSave + basketTwoSave - price);

  return (
    <div className="mx-auto max-w-6xl">
      <SignupProgress step={2} stepLabel="Membership Summary" />

      <SavingsTicker images={tickerImages} />

      <div className="mt-10 text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Unlock Unlimited Food Savings Today
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          One purchase pays for your month. Review your details below to activate
          instant access across all partner offers.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-foreground">
            How Your Membership Pays For Itself
          </h2>

          <div className="mt-6 space-y-5">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-foreground">
                Item 1: Specialty Pantry & Coffee
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDollars(BASKET_ONE_SPEND)} order @ 15% off → Save{" "}
                <span className="font-semibold text-emerald-600">
                  {formatDollars(basketOneSave)}
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-50 p-4">
              <p className="text-sm font-semibold leading-relaxed text-emerald-800">
                Your {formatted} monthly membership is already fully covered +{" "}
                {formatDollars(Math.max(orderOneProfit, 0))} profit on Order #1.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-foreground">
                Item 2: Monthly Meat, Produce & Staples
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDollars(BASKET_TWO_SPEND)} spend @ 15% off → Save{" "}
                <span className="font-semibold text-emerald-600">
                  {formatDollars(basketTwoSave)}
                </span>
              </p>
            </div>

            <div className="rounded-lg bg-navy p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Net Monthly Result
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {formatSignedDollars(netMonthly)} Net Pocket Savings Every Month
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            <li className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              Instant access to all active NZ partner discounts immediately after checkout.
            </li>
            <li className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              No lock-in contracts — pause or cancel anytime in 1 click from your account.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
          <div className="mt-6 space-y-4 border-b border-border pb-6">
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="pt-0.5 text-muted-foreground">Monthly Membership</span>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="font-semibold text-foreground">{formattedMonthly}</span>
                <span className="inline-flex rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Pays for itself on order #1
                </span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="pt-0.5 text-muted-foreground">Activation Fee</span>
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-semibold text-success">FREE</span>
                <span className="inline-flex rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {formatDollars(0)} / Save ${WAIVED_ACTIVATION_FEE} Today
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-6">
            <span className="font-semibold text-foreground">Total due today</span>
            <span className="text-3xl font-bold text-primary">{formatted}</span>
          </div>
          <MembershipCheckoutButton cancelled={cancelled} />
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            🔒 256-bit Encrypted • Instant Access Immediately After Payment • Cancel Anytime
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-semibold text-primary underline">
              Subscription Terms
            </Link>{" "}
            and authorize monthly billing.
          </p>
        </div>
      </div>
    </div>
  );
}
