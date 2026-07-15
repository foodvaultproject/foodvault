"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PartnerOnboardingState } from "@/lib/partner-status";
import {
  portalHelper,
  portalPageTitle,
  portalCardTitle,
  portalMetricValue,
} from "@/lib/partner-portal-classes";

export const PARTNER_ACTIVE_ID_SESSION_KEY = "fv-active-partner-id";

export function listingLiveBannerDismissKey(partnerId: string) {
  return `fv-listing-live-dismissed:${partnerId}`;
}

export function dismissListingLiveBanner(partnerId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(listingLiveBannerDismissKey(partnerId), "1");
}

function TimelineStep({
  label,
  status,
}: {
  label: string;
  status: "complete" | "current" | "upcoming";
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
        status === "complete"
          ? "bg-white/20 text-white"
          : status === "current"
            ? "bg-white text-primary"
            : "bg-white/10 text-white/80"
      }`}
    >
      {status === "complete" ? "✓" : status === "current" ? "●" : "○"} {label}
    </span>
  );
}

function ChecklistStep({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
        complete ? "bg-white/20 text-white" : "bg-white/10 text-white/80"
      }`}
    >
      {complete ? "✓" : "○"} {label}
    </span>
  );
}

type PartnerOnboardingStatusBannerProps = {
  state: PartnerOnboardingState;
  memberCode?: string | null;
  partnerId?: string | null;
  className?: string;
  previewMode?: boolean;
  onActivate?: () => void;
  confirmingActivation?: boolean;
};

function ListingLiveBanner({
  partnerId,
  className,
}: {
  partnerId?: string | null;
  className?: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!partnerId) return;
    setHidden(localStorage.getItem(listingLiveBannerDismissKey(partnerId)) === "1");
  }, [partnerId]);

  if (hidden) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-success/30 bg-success-light px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-start gap-3 sm:items-center">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`${portalCardTitle} text-foreground`}>Listing Live</h2>
            <span className="rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Live
            </span>
          </div>
          <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">
            Your business is now visible to FoodVault members.
          </p>
        </div>
      </div>
      {partnerId ? (
        <button
          type="button"
          onClick={() => {
            dismissListingLiveBanner(partnerId);
            setHidden(true);
          }}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-success/30 bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-success/10"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}

export function PartnerOnboardingStatusBanner({
  state,
  memberCode,
  partnerId,
  className = "mb-4",
  previewMode = false,
  onActivate,
  confirmingActivation = false,
}: PartnerOnboardingStatusBannerProps) {
  if (state === "APPLICATION_UNDER_REVIEW") {
    return (
      <div className={`rounded-lg bg-primary p-4 text-white sm:p-5 ${className}`}>
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] font-bold leading-snug text-white">
              Application Under Review
            </h1>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-white/90">
              Thank you for applying to FoodVault. Our team is currently reviewing
              your business and member offer. Your listing cannot be edited or
              published until your application has been approved. We will notify you
              by email once your application has been reviewed.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
              <TimelineStep label="Application Submitted" status="complete" />
              <TimelineStep label="Under Review" status="current" />
              <TimelineStep label="Approved" status="upcoming" />
              <TimelineStep label="Activate Member Offer" status="upcoming" />
              <TimelineStep label="Listing Live" status="upcoming" />
            </div>
            <button
              type="button"
              disabled
              className="mt-4 inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-white/20 px-4 py-2 text-[0.8125rem] font-semibold text-white/80"
            >
              Application Being Reviewed
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "APPROVED_PENDING_ACTIVATION") {
    return (
      <div className={`rounded-lg bg-orange-500 p-4 text-white sm:p-5 ${className}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </span>
            <div className="min-w-0">
              <h1 className={`${portalPageTitle} text-white`}>Your Listing Is Not Live</h1>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-white/90">
                One final step remains before FoodVault members can discover your
                business. Add your FoodVault member discount code to your own website,
                then confirm it has been activated.
              </p>
              {memberCode ? (
                <div className="mt-3 inline-flex rounded-lg bg-white/15 px-3 py-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                      Your Member Code
                    </p>
                    <p className={`${portalMetricValue} mt-1 font-mono text-white`}>
                      {memberCode}
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <ChecklistStep label="Application Approved" complete />
                <ChecklistStep label="Member Code Generated" complete />
                <ChecklistStep label="Confirm Member Offer Activated" complete={false} />
                <ChecklistStep label="Listing Live" complete={false} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            {previewMode ? (
              <Link
                href="/partner/listing#offer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-[0.8125rem] font-semibold text-orange-600 transition-colors hover:bg-white/90"
              >
                Complete Setup in Partner Portal
              </Link>
            ) : (
              <button
                type="button"
                onClick={onActivate}
                disabled={confirmingActivation}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-white/90 disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {confirmingActivation ? "Confirming..." : "I've Activated My Member Offer"}
              </button>
            )}
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-4 py-2 text-[0.8125rem] font-semibold text-white/70"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ListingLiveBanner partnerId={partnerId} className={className} />;
}
