"use client";

import { PartnerOnboardingStatusBanner } from "./PartnerOnboardingStatusBanner";
import { usePartnerOnboarding } from "./PartnerOnboardingProvider";
import {
  portalBtnOutline,
  portalBtnPrimary,
  portalHelper,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";

function ActivationDialog() {
  const {
    showActivationDialog,
    closeActivationDialog,
    confirmActivation,
    confirmingActivation,
  } = usePartnerOnboarding();

  if (!showActivationDialog) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activation-dialog-title"
    >
      <div className="w-full max-w-md rounded-md border border-border bg-background px-5 py-4 shadow-xl">
        <h2 id="activation-dialog-title" className={portalSectionTitle}>
          Confirm Member Offer
        </h2>
        <p className={`${portalHelper} mt-2 leading-relaxed`}>
          I confirm I have added my FoodVault member discount code to my website
          and members can now redeem this offer.
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeActivationDialog}
            disabled={confirmingActivation}
            className={`${portalBtnOutline} disabled:opacity-60`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirmActivation()}
            disabled={confirmingActivation}
            className={`${portalBtnPrimary} disabled:opacity-60`}
          >
            {confirmingActivation ? "Confirming..." : "Yes, My Offer Is Live"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PartnerOnboardingBanner() {
  const { loading, onboardingState, openActivationDialog, partner, confirmingActivation } =
    usePartnerOnboarding();

  if (loading || onboardingState === "APPLICATION_INCOMPLETE") {
    return null;
  }

  return (
    <>
      <PartnerOnboardingStatusBanner
        state={onboardingState}
        memberCode={partner?.member_code}
        partnerId={partner?.id}
        onActivate={openActivationDialog}
        confirmingActivation={confirmingActivation}
      />
      <ActivationDialog />
    </>
  );
}
