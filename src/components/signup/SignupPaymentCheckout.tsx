"use client";

import Link from "next/link";
import { useState } from "react";
import { SignupProgress } from "@/components/signup/SignupProgress";
import {
  formatMembershipPrice,
  formatMembershipPriceMonthly,
  type MembershipSettings,
} from "@/lib/member/pricing";

type SignupPaymentCheckoutProps = {
  settings: MembershipSettings;
  cancelled?: boolean;
};

export function SignupPaymentCheckout({
  settings,
  cancelled = false,
}: SignupPaymentCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatted = formatMembershipPrice(settings.membershipPriceMonthly);
  const formattedMonthly = formatMembershipPriceMonthly(settings.membershipPriceMonthly);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/member/checkout", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Unable to start checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
      <SignupProgress step={3} stepLabel="Secure Payment" />

      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Secure Payment</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Complete your FoodVault membership with secure monthly billing through Stripe.
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">FOODVAULT Membership</h2>
            <p className="mt-1 text-sm text-muted-foreground">Billed monthly · Cancel anytime</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{formattedMonthly}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>

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

        {cancelled ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Payment was cancelled. You can try again when you&apos;re ready.
          </p>
        ) : null}

        {error ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleCheckout()}
          disabled={loading}
          className="fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-sm px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
        >
          {loading ? "Redirecting to Stripe..." : "Make Payment Now"}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="font-semibold text-primary underline">
            Subscription Terms
          </Link>{" "}
          and authorize monthly billing. Your membership activates after payment is confirmed.
        </p>
      </div>
    </div>
  );
}
