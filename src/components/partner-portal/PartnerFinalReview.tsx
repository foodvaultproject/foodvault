"use client";

import Link from "next/link";
import { useState } from "react";
import {
  portalBtnPrimary,
  portalCard,
  portalCardTitle,
  portalHelper,
  portalMetricValue,
  portalPage,
  portalPageHeader,
  portalPageSubtitle,
  portalPageTitle,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";
import { PartnerPortalShell } from "./PartnerPortalShell";
import { defaultPartnerListing } from "@/data/partner-portal";

const reviewItems = [
  "Business Information",
  "Categories",
  "Images",
  "Member Offer",
  "Discount Code",
];

export function PartnerFinalReview() {
  const [offerConfirmed, setOfferConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <PartnerPortalShell>
        <div className="mx-auto max-w-2xl p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className={`${portalPageTitle} mt-5`}>Listing Submitted</h1>
          <p className={`${portalHelper} mt-2`}>
            Your listing is being prepared and will go live once final checks are complete.
          </p>
          <Link
            href="/partner"
            className={`${portalBtnPrimary} mt-6`}
          >
            Back to Dashboard
          </Link>
        </div>
      </PartnerPortalShell>
    );
  }

  return (
    <PartnerPortalShell>
      <div className={portalPage}>
        <div className={portalPageHeader}>
          <h1 className={portalPageTitle}>Final Review</h1>
          <p className={portalPageSubtitle}>
            Before your listing goes live, please confirm everything below is correct.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className={`${portalCard} sm:px-5 sm:py-4`}>
              <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
                Review Checklist
              </p>
              <ul className="mt-6 space-y-4">
                {reviewItems.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
              <div className="flex gap-3">
                <span className="text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </span>
                <p className={`${portalHelper} leading-relaxed`}>
                  FoodVault does not verify your website automatically. Please ensure your
                  member offer has been created on your website before confirming below.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={portalCard}>
              <h2 className={portalSectionTitle}>Offer Status</h2>
              <p className="mt-3 text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
                Current Member Code
              </p>
              <div className="mt-2 rounded-lg bg-surface-lavender px-4 py-3 text-center">
                <p className={`${portalMetricValue} text-primary`}>{defaultPartnerListing.memberCode}</p>
              </div>

              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <div className="flex gap-2">
                  <span className="text-red-500">⚠</span>
                  <p className="text-sm font-medium text-red-700">
                    {offerConfirmed ? "Offer Confirmed" : "Waiting For Confirmation"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOfferConfirmed(true)}
                className={`${portalBtnPrimary} mt-4 w-full`}
              >
                I&apos;ve Activated My Member Offer
              </button>

              <button
                type="button"
                disabled={!offerConfirmed}
                onClick={() => setSubmitted(true)}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-primary/10 text-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5M4.5 10.5h15m-15 0a3 3 0 00-3 3v6.75a3 3 0 003 3h15a3 3 0 003-3v-6.75a3 3 0 00-3-3" />
                </svg>
                Submit Listing
              </button>
              <p className={`${portalHelper} mt-2 text-center`}>
                &ldquo;Submit Listing&rdquo; only becomes enabled after the offer is confirmed.
              </p>
            </div>

            <div className={portalCard}>
              <h3 className={portalCardTitle}>Need help?</h3>
              <p className={`${portalHelper} mt-1`}>
                Our partner support team is available to help you set up your discount code.
              </p>
              <Link href="/partner/support" className="mt-3 inline-flex text-sm font-medium text-primary">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
