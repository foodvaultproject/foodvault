"use client";

import Link from "next/link";
import { ChecklistIcon, PartnerPortalShell } from "./PartnerPortalShell";
import { setupChecklist } from "@/data/partner-portal";
import {
  portalCard,
  portalCardTitle,
  portalHelper,
  portalMetricValue,
  portalPage,
  portalPageTitle,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";

const metrics = [
  {
    label: "Listing Status",
    value: "Pending",
    description: "Currently being prepared for FoodVault members.",
    icon: "💬",
    iconBg: "bg-orange-100 text-orange-600",
  },
  {
    label: "Website Clicks",
    value: "0",
    description: "Total clicks sent to your website.",
    icon: "🖱",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    label: "Listing Views",
    value: "0",
    description: "How many times members viewed your profile.",
    icon: "👁",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    label: "Member Saves",
    value: "0",
    description: "How many members have favourited your business.",
    icon: "♥",
    iconBg: "bg-red-100 text-red-600",
  },
];

const quickActions = [
  { href: "/partner/listing", title: "Edit Listing", subtitle: "Update your profile", icon: "✎", bg: "bg-primary/10 text-primary" },
  { href: "/partner/listing#offer", title: "Edit Member Offer", subtitle: "Update discount or offer", icon: "%", bg: "bg-teal-100 text-teal-700" },
  { href: "/partner/listing", title: "Preview Listing", subtitle: "See what members see", icon: "👁", bg: "bg-success-light text-success" },
  { href: "/partner/support", title: "Contact Support", subtitle: "Need help?", icon: "?", bg: "bg-purple-100 text-purple-600" },
];

export function PartnerDashboard() {
  return (
    <PartnerPortalShell>
      <div className={portalPage}>
        <div className="rounded-lg bg-orange-500 p-4 text-white sm:p-5">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h1 className={`${portalPageTitle} text-white`}>Your Listing Is Not Live</h1>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-white/90">
                Complete the final steps below before FoodVault members can discover
                your business for brand discovery and direct-to-consumer sales.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
                {["Application Approved", "Member Code Generated", "Confirm Member Offer Activated", "Listing Live"].map(
                  (step, index) => (
                    <span
                      key={step}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                        index < 2 ? "bg-white/20" : "bg-white/10"
                      }`}
                    >
                      {index < 2 ? "✓" : "○"} {step}
                    </span>
                  )
                )}
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/partner/review"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-600"
                >
                  Complete Setup
                </Link>
                <Link
                  href="/partner/listing#offer"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-white px-4 py-2 text-sm font-semibold text-white"
                >
                  Edit Member Code
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className={portalCard}>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-base ${metric.iconBg}`}>
                {metric.icon}
              </span>
              <p className={`${portalMetricValue} mt-3`}>{metric.value}</p>
              <p className={`${portalCardTitle} mt-0.5`}>{metric.label}</p>
              <p className={`${portalHelper} mt-0.5`}>{metric.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            <div className="border-b border-border bg-primary/5 px-5 py-3">
              <h2 className={portalSectionTitle}>Setup Checklist</h2>
            </div>
            <ul className="divide-y divide-border">
              {setupChecklist.map((item) => (
                <li key={item.id} className="flex gap-3 px-5 py-4">
                  <ChecklistIcon complete={item.complete} />
                  <div>
                    <p className={portalCardTitle}>{item.title}</p>
                    <p className={`${portalHelper} mt-0.5`}>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={`${portalSectionTitle} mb-3`}>Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`${portalCard} flex items-center gap-3 transition-colors hover:border-primary/30`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${action.bg}`}>
                    {action.icon}
                  </span>
                  <div>
                    <p className={portalCardTitle}>{action.title}</p>
                    <p className={portalHelper}>{action.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
