"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/affiliate/format";
import type { AffiliatePayoutAccount, PayoutHistoryItem } from "@/lib/payment-service/types";

type AffiliatePayoutSettingsProps = {
  payoutAccount: AffiliatePayoutAccount;
  payoutHistory: PayoutHistoryItem[];
  approvedEarnings: number;
  onRefresh: () => Promise<void>;
};

export function AffiliatePayoutSettings({
  payoutAccount,
  payoutHistory,
  approvedEarnings,
  onRefresh,
}: AffiliatePayoutSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startOnboarding() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/connect/onboard", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to start Stripe Connect onboarding.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Unable to start Stripe Connect onboarding.");
      setLoading(false);
    }
  }

  const isReady =
    payoutAccount.connected &&
    payoutAccount.onboardingStatus === "complete" &&
    payoutAccount.payoutsEnabled;

  return (
    <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Payout Settings</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Connect your payout account through Stripe to receive approved commissions automatically.
        Banking and tax details are collected securely by Stripe — FoodVault never stores them.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Payout Account
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {isReady ? "✅ Connected" : payoutAccount.connected ? "⚪ Pending setup" : "⚪ Not connected"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Verification
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {payoutAccount.onboardingStatus === "complete"
              ? "Verified"
              : payoutAccount.onboardingStatus === "restricted"
                ? "Action required"
                : "Pending"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Default Payout Method
          </dt>
          <dd className="mt-1 text-sm text-foreground">Managed by Stripe</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Approved Earnings
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {formatCurrency(approvedEarnings)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        {!isReady ? (
          <button
            type="button"
            onClick={() => void startOnboarding()}
            disabled={loading}
            className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
          >
            {loading ? "Redirecting..." : "Connect Payout Account"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startOnboarding()}
            disabled={loading}
            className="inline-flex rounded-sm border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-primary/5 disabled:opacity-60"
          >
            Update payout details
          </button>
        )}
        <button
          type="button"
          onClick={() => void onRefresh()}
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-primary/5"
        >
          Refresh status
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-sm font-bold text-foreground">Payout History</h3>
        <p className="mt-3 text-xs text-muted-foreground">
          Need a full record?{" "}
          <a href="/api/affiliate/export/commissions" className="font-semibold text-primary hover:text-primary-hover">
            Download commission CSV
          </a>
        </p>
        {payoutHistory.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No payouts yet. Approved commissions are paid monthly after Stripe Connect onboarding
            is complete.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Paid</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((item) => (
                  <tr key={item.id} className="border-b border-border/70">
                    <td className="px-3 py-3 text-muted-foreground">
                      {new Date(item.periodStart).toLocaleDateString("en-NZ")} –{" "}
                      {new Date(item.periodEnd).toLocaleDateString("en-NZ")}
                    </td>
                    <td className="px-3 py-3 text-foreground">
                      {formatCurrency(item.amount, item.currency)}
                    </td>
                    <td className="px-3 py-3 capitalize text-foreground">{item.status}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {item.paidAt ? new Date(item.paidAt).toLocaleDateString("en-NZ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
