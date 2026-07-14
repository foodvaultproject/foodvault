"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/account/ConfirmModal";
import { MemberTrialBannerCard } from "@/components/account/MemberTrialBannerCard";
import { cancelMembershipAction } from "@/lib/member/account-actions";
import { formatMemberDateShort } from "@/lib/member/format";
import {
  formatMembershipPriceMonthly,
  type MembershipSettings,
} from "@/lib/member/pricing";
import type { MemberTrialBanner, MembershipRecord } from "@/lib/member/queries";

const features = [
  {
    title: "Unlimited access to member offers",
    description:
      "Browse every participating FoodVault partner and unlock member-only pricing.",
    icon: "🏷️",
  },
  {
    title: "Discover new brands",
    description:
      "Search by category for food, beverage, and household brands across New Zealand.",
    icon: "🔍",
  },
  {
    title: "Save your favourites",
    description: "Quick access to the brands you love most.",
    icon: "❤️",
  },
  {
    title: "Direct from participating brands",
    description:
      "FoodVault connects you to brands. Purchases and payments happen directly with them.",
    icon: "🏪",
  },
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel your membership at any time from this page. Your access continues until the end of your current billing period.",
  },
  {
    question: "Does FoodVault sell products?",
    answer:
      "No. FoodVault is a membership and discovery platform. You shop directly on each partner's website.",
  },
  {
    question: "Why do I leave FoodVault to buy?",
    answer:
      "Partner brands manage their own checkout, shipping, and customer service so you get the authentic brand experience.",
  },
  {
    question: "My member discount isn't working.",
    answer:
      "Contact the brand first with your member details. If the issue continues, reach out to FoodVault support.",
  },
];

type Feedback = { type: "error" | "success" | "info"; text: string };

const memberStatusSectionClass =
  "rounded-lg border border-primary/30 bg-violet-50 p-4 shadow-sm";

type MemberMembershipViewProps = {
  trialBanner: MemberTrialBanner | null;
  membership: MembershipRecord | null;
  settings: MembershipSettings;
};

export function MemberMembershipView({
  trialBanner,
  membership,
  settings,
}: MemberMembershipViewProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isPaidMember =
    Boolean(membership?.stripeSubscriptionId?.trim()) ||
    membership?.status === "active";
  const isTrialing = !isPaidMember && Boolean(trialBanner?.showTrialBanner);

  const priceLabel = formatMembershipPriceMonthly(settings.membershipPriceMonthly);
  const hasPaymentMethod = Boolean(membership?.stripeCustomerId?.trim());
  const maskedPaymentMethod = hasPaymentMethod
    ? "•••• •••• •••• ••••"
    : "No payment method on file";

  async function openBillingPortal(actionKey: string) {
    setLoadingAction(actionKey);
    setFeedback(null);

    try {
      const response = await fetch("/api/payments/member/billing-portal", {
        method: "POST",
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setFeedback({
          type: "error",
          text: data.error ?? "Unable to open the billing portal. Please try again.",
        });
        setLoadingAction(null);
        return;
      }

      window.location.href = data.url;
    } catch {
      setFeedback({
        type: "error",
        text: "Unable to open the billing portal. Please try again.",
      });
      setLoadingAction(null);
    }
  }

  async function handleCancelMembership() {
    setLoadingAction("cancel");
    setFeedback(null);
    const result = await cancelMembershipAction();
    setLoadingAction(null);
    setShowCancelModal(false);

    if ("error" in result && result.error) {
      setFeedback({ type: "error", text: result.error });
      return;
    }

    setFeedback({ type: "success", text: "Your membership has been cancelled." });
    router.refresh();
  }

  const feedbackStyles: Record<Feedback["type"], string> = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <>
      <div className="min-h-screen bg-[#f3f4f6]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-5">
          <h1 className="text-[18px] font-bold tracking-tight text-foreground">
            Membership
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isPaidMember
              ? "Manage your FoodVault membership, billing and subscription."
              : "View your FoodVault membership status and benefits."}
          </p>

          {feedback ? (
            <p
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${feedbackStyles[feedback.type]}`}
            >
              {feedback.text}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {isPaidMember ? (
              <section className={memberStatusSectionClass}>
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                  Active Member
                </span>
                <p className="mt-3 text-xl font-bold text-foreground">
                  FoodVault Member
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your paid membership is active. Manage your billing details below.
                </p>
              </section>
            ) : isTrialing && trialBanner ? (
              <MemberTrialBannerCard
                trialBanner={trialBanner}
                className={`${memberStatusSectionClass} !bg-violet-50 !p-4 sm:!p-4`}
              />
            ) : (
              <section className={memberStatusSectionClass}>
                <span className="inline-flex rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Membership Inactive
                </span>
                <p className="mt-3 text-xl font-bold text-foreground">
                  FoodVault Member
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  You don&apos;t have an active paid membership right now.
                </p>
              </section>
            )}

            <section className="rounded-lg border border-border bg-background p-4 shadow-sm">
              <h2 className="text-[14px] font-bold text-foreground">
                Membership Includes
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-lg bg-surface p-3">
                    <span className="text-lg" aria-hidden="true">
                      {feature.icon}
                    </span>
                    <h3 className="mt-2 text-[12px] font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {isPaidMember ? (
            <section className="mt-4 rounded-lg border border-border bg-background p-4 shadow-sm">
              <h2 className="text-[14px] font-bold text-foreground">Billing Details</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Current Plan</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    FoodVault Member
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Subscription Price</dt>
                  <dd className="mt-1 font-semibold text-foreground">{priceLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Next Billing Date</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {formatMemberDateShort(membership?.renewalDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Payment Method</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {maskedPaymentMethod}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => void openBillingPortal("payment")}
                  disabled={loadingAction === "payment"}
                  className="inline-flex items-center justify-center rounded-sm border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
                >
                  {loadingAction === "payment" ? "Opening..." : "Update Payment Method"}
                </button>
                <button
                  type="button"
                  onClick={() => void openBillingPortal("history")}
                  disabled={loadingAction === "history"}
                  className="inline-flex items-center justify-center rounded-sm border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
                >
                  {loadingAction === "history" ? "Opening..." : "View Billing History"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 sm:ml-auto"
                >
                  Cancel Membership
                </button>
              </div>
            </section>
          ) : (
            <section className="mt-4 rounded-lg border border-dashed border-border bg-background p-4 shadow-sm">
              <h2 className="text-[14px] font-bold text-foreground">Billing Details</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isTrialing
                  ? "Billing management will be available once your paid membership begins. There's nothing to pay or manage during your free trial."
                  : "Billing management becomes available once you start a paid membership."}
              </p>
            </section>
          )}

          <section className="mt-4 rounded-lg border border-border bg-background p-4 shadow-sm">
            <h2 className="text-[14px] font-bold text-foreground">Help &amp; Support</h2>
            <div className="mt-3 space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="border-b border-border pb-3 last:border-b-0 last:pb-0"
                >
                  <h3 className="text-[12px] font-bold text-foreground">{faq.question}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={showCancelModal}
        title="Cancel your membership?"
        description="Your membership will remain active until the end of your current billing period."
        confirmLabel="Cancel Membership"
        destructive
        loading={loadingAction === "cancel"}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={() => void handleCancelMembership()}
      />
    </>
  );
}
