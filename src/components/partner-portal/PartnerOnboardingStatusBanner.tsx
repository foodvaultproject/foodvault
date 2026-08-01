"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PartnerOnboardingState } from "@/lib/partner-status";
import {
  onboardingBannerBody,
  onboardingBannerCodeValue,
  onboardingBannerTitle,
  portalCardTitle,
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

function CodeCopyPanel({
  code,
  label,
  copyAriaLabel,
}: {
  code: string;
  label: string;
  copyAriaLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [code]);

  return (
    <div className="mt-3 flex items-stretch overflow-hidden rounded-lg bg-white/15">
      <div className="flex min-w-0 flex-1 flex-col px-3 py-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
          {label}
        </p>
        <p className={`${onboardingBannerCodeValue} mt-1 truncate font-mono text-white`}>
          {code}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? `${copyAriaLabel} copied` : copyAriaLabel}
        className="inline-flex shrink-0 items-center gap-1.5 border-l border-white/20 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:px-4 sm:text-sm"
      >
        {copied ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 011.927-.184"
              />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}

function MemberCodeCopyPanel({ memberCode }: { memberCode: string }) {
  return (
    <CodeCopyPanel
      code={memberCode}
      label="Your Member Code"
      copyAriaLabel="Copy member code"
    />
  );
}

type PartnerOnboardingStatusBannerProps = {
  state: PartnerOnboardingState;
  memberCode?: string | null;
  vaultDropCode?: string | null;
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
  vaultDropCode,
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
              <h1 className={`${onboardingBannerTitle} text-white`}>
                Your Listing Is Not Live
              </h1>
              <p className={`${onboardingBannerBody} text-white/90`}>
                One final step remains before FoodVault members can discover your
                business. Add your FoodVault member discount code to your own website,
                {vaultDropCode
                  ? " plus your FLASH SALE code if you listed clearance items,"
                  : " "}
                then confirm it has been activated.
              </p>
              {memberCode ? <MemberCodeCopyPanel memberCode={memberCode} /> : null}
              {vaultDropCode ? (
                <CodeCopyPanel
                  code={vaultDropCode}
                  label="Your FLASH SALE Code"
                  copyAriaLabel="Copy FLASH SALE code"
                />
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            {previewMode ? (
              <Link
                href="/partner/listing#offer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-white/90"
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
