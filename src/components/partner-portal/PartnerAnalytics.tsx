"use client";

import { PartnerPortalShell } from "./PartnerPortalShell";
import { analyticsData } from "@/data/partner-portal";
import {
  portalCard,
  portalHelper,
  portalMetricValue,
  portalPage,
  portalPageHeader,
  portalPageSubtitle,
  portalPageTitle,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";

const metricCards = [
  {
    label: "Listing Views",
    value: analyticsData.listingViews.value,
    change: analyticsData.listingViews.change,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    ),
    iconBg: "bg-primary/10 text-primary",
  },
  {
    label: "Website Clicks",
    value: analyticsData.websiteClicks.value,
    change: analyticsData.websiteClicks.change,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 8.394a5.25 5.25 0 010 7.424m-7.424-7.424a5.25 5.25 0 017.424 0M9.75 9.75l-1.5 1.5m0 0l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5l-1.5-1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    iconBg: "bg-teal-100 text-teal-700",
  },
  {
    label: "Member Saves",
    value: analyticsData.memberSaves.value,
    change: analyticsData.memberSaves.change,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    ),
    iconBg: "bg-red-100 text-red-600",
  },
];

const activityIcons = {
  view: "👁",
  click: "🖱",
  save: "♥",
};

export function PartnerAnalytics() {
  return (
    <PartnerPortalShell>
      <div className={portalPage}>
        <div className={`${portalPageHeader} flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between`}>
          <div>
            <h1 className={portalPageTitle}>Performance View</h1>
            <p className={portalPageSubtitle}>
              Key metrics and recent activity for your business.
            </p>
          </div>
          <p className={portalHelper}>
            Last Updated: {analyticsData.lastUpdated}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {metricCards.map((metric) => (
            <div key={metric.label} className={portalCard}>
              <div className="flex items-start justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.iconBg}`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {metric.icon}
                  </svg>
                </span>
                <span className="text-sm font-medium text-success">{metric.change}</span>
              </div>
              <p className={`${portalMetricValue} mt-3`}>{metric.value}</p>
              <p className={`${portalHelper} mt-0.5`}>{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className={portalCard}>
              <h2 className={`${portalSectionTitle} flex items-center gap-2`}>
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Top Search Categories
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {analyticsData.topSearchCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className={portalCard}>
              <h2 className={`${portalSectionTitle} flex items-center gap-2`}>
                <span className="text-primary">★</span>
                Most Popular Collection
              </h2>
              <ul className="mt-3 divide-y divide-border">
                {analyticsData.popularCollections.map((item) => (
                  <li key={item.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className={portalHelper}>{item.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={portalCard}>
            <h2 className={portalSectionTitle}>Recent Activity</h2>
            <ul className="mt-3 space-y-3">
              {analyticsData.recentActivity.map((item, index) => (
                <li key={index} className="flex gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-sm">
                    {activityIcons[item.type as keyof typeof activityIcons]}
                  </span>
                  <div>
                    <p className="text-sm text-foreground">{item.message}</p>
                    <p className={portalHelper}>{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
