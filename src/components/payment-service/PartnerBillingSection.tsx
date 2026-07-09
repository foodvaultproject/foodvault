"use client";

import { useState } from "react";
import type { PartnerBillingProfile } from "@/lib/payment-service/types";
import {
  portalCard,
  portalHelper,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";

type PartnerBillingSectionProps = {
  billing: PartnerBillingProfile;
};

export function PartnerBillingSection({ billing }: PartnerBillingSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSetup() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/partner/setup", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to start billing setup.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Unable to start billing setup.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className={portalSectionTitle}>Billing &amp; Payments</h2>
        <p className={`${portalHelper} mt-1`}>
          Add a payment method so FoodVault can automatically bill your approved affiliate
          commissions each month.
        </p>
      </div>

      <div className={portalCard}>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Payment Method
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {billing.configured && billing.hasPaymentMethod
                ? "✅ Active"
                : "⚪ Not configured"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Billing Status
            </dt>
            <dd className="mt-1 text-sm capitalize text-foreground">
              {billing.billingStatus ?? "none"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Provider
            </dt>
            <dd className="mt-1 text-sm text-foreground">Stripe</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Billing Cycle
            </dt>
            <dd className="mt-1 text-sm text-foreground">Monthly</dd>
          </div>
        </dl>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => void startSetup()}
            disabled={loading}
            className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
          >
            {loading
              ? "Redirecting..."
              : billing.configured
                ? "Update payment method"
                : "Add payment method"}
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-6 text-xs text-muted-foreground">
          Approved affiliate commissions are invoiced monthly. Payment is processed automatically
          through the Payment Service — your card is never exposed in the FoodVault dashboard.
        </p>
      </div>
    </div>
  );
}
