import Link from "next/link";
import { SignupProgress } from "@/components/signup/SignupProgress";
import {
  formatMembershipPrice,
  formatMembershipPriceMonthly,
  type MembershipSettings,
} from "@/lib/member/pricing";
import { SIGNUP_PAYMENT_PATH } from "@/lib/member/paths";

const features = [
  "Access all partner discounts",
  "Discover new brands",
  "Weekly new partners",
  "Favourite brands tracking",
  "Cancel anytime",
];

export function MembershipReview({ settings }: { settings: MembershipSettings }) {
  const price = settings.membershipPriceMonthly;
  const formatted = formatMembershipPrice(price);
  const formattedMonthly = formatMembershipPriceMonthly(price);

  return (
    <div className="mx-auto max-w-6xl">
      <SignupProgress step={2} stepLabel="Membership Summary" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Review Your Membership</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Almost there! Review your plan details and secure access to exclusive food
          savings and rewards.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
              <h2 className="text-xl font-bold text-foreground">FOODVAULT Membership</h2>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{formattedMonthly}</p>
                <p className="text-xs text-muted-foreground">Billed monthly</p>
              </div>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
            <h3 className="font-bold uppercase tracking-wide text-[#0f766e]">
              No Lock-In Contracts
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You can pause or cancel your membership at any time from your account
              settings. No cancellation fees.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
          <div className="mt-6 space-y-4 border-b border-border pb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Membership</span>
              <span className="font-semibold text-foreground">{formatted}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Activation Fee</span>
              <span className="font-semibold text-success">FREE</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-6">
            <span className="font-semibold text-foreground">Total due today</span>
            <span className="text-3xl font-bold text-primary">{formatted}</span>
          </div>
          <Link
            href={SIGNUP_PAYMENT_PATH}
            className="fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-sm px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
          >
            Continue to Payment
          </Link>
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
