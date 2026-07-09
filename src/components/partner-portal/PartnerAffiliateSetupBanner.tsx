"use client";

import Link from "next/link";
import { portalCardTitle, portalHelper } from "@/lib/partner-portal-classes";
import { usePartnerAffiliateSetupStatus } from "./usePartnerAffiliateSetupStatus";

type PartnerAffiliateSetupBannerProps = {
  variant?: "detailed" | "compact";
  className?: string;
};

export function PartnerAffiliateSetupBanner({
  variant = "detailed",
  className = "",
}: PartnerAffiliateSetupBannerProps) {
  const { loading, visible, incompleteTasks } = usePartnerAffiliateSetupStatus();

  if (loading || !visible) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div
        className={`border-b border-amber-200 bg-amber-50/90 px-4 py-2.5 sm:px-6 lg:px-8 ${className}`.trim()}
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-950">
            <span className="font-semibold">Action required:</span> complete your Affiliate
            Program setup so it appears on your public brand profile.
          </p>
          <Link
            href="/partner/affiliate-program"
            className="inline-flex shrink-0 items-center justify-center text-sm font-semibold text-amber-900 underline-offset-2 hover:underline"
          >
            Complete setup →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 px-4 py-4 sm:px-5 ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={`${portalCardTitle} text-red-900`}>
            Action required: complete your Affiliate Program setup
          </h2>
          <p className={`${portalHelper} mt-1 text-red-800/90`}>
            You enabled the Affiliate Program in your application, but it will not appear on
            your public brand profile until the required setup steps below are complete.
          </p>
          <ol className="mt-3 space-y-2">
            {incompleteTasks.map((task, index) => (
              <li
                key={task.id}
                className="rounded-lg border border-red-200 bg-white/70 px-3 py-2.5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {index + 1}. {task.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <Link
                    href={task.href}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Complete setup
                  </Link>
                </div>
              </li>
            ))}
          </ol>
          <p className={`${portalHelper} mt-3 text-red-800/90`}>
            Once Shopify is connected and your payment method is added, your affiliate program
            will display on your brand profile and affiliates can begin promoting your business.
          </p>
          <Link
            href="/partner/affiliate-program"
            className="mt-3 inline-flex text-xs font-semibold text-red-700 hover:underline"
          >
            Open Affiliate Program dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
