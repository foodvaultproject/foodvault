"use client";

import type { PartnerAffiliateAnalytics } from "@/lib/partner-affiliate/analytics";
import { AffiliateSummaryCard } from "@/components/partner-affiliate/AffiliateSummaryCard";
import { BreakdownList, SimpleBarChart } from "@/components/partner-affiliate/AffiliateCharts";
import { portalHelper, portalSectionTitle } from "@/lib/partner-portal-classes";

type PartnerAffiliateAnalyticsSectionProps = {
  analytics: PartnerAffiliateAnalytics;
};

export function PartnerAffiliateAnalyticsSection({
  analytics,
}: PartnerAffiliateAnalyticsSectionProps) {
  const referrerTotal = analytics.topReferrers.reduce((sum, item) => sum + item.clicks, 0);
  const deviceTotal = analytics.topDevices.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className={portalSectionTitle}>Click Analytics</h2>
        <p className={`${portalHelper} mt-1`}>
          Track referral traffic across your affiliate program.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AffiliateSummaryCard label="Today's Clicks" value={analytics.clicksToday} />
        <AffiliateSummaryCard label="Last 7 Days" value={analytics.clicks7Days} />
        <AffiliateSummaryCard label="Last 30 Days" value={analytics.clicks30Days} />
        <AffiliateSummaryCard label="All Time" value={analytics.clicksAllTime} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SimpleBarChart
          title="Daily clicks (last 30 days)"
          items={analytics.dailyClicks.map((item) => ({
            label: item.day,
            value: item.clicks,
          }))}
        />
        <SimpleBarChart
          title="Monthly clicks (last 12 months)"
          items={analytics.monthlyClicks.map((item) => ({
            label: item.month,
            value: item.clicks,
          }))}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BreakdownList
          title="Top referral sources"
          items={analytics.topReferrers.map((item) => ({
            label: item.source,
            value: item.clicks,
          }))}
          total={referrerTotal}
        />
        <BreakdownList
          title="Top devices"
          items={analytics.topDevices.map((item) => ({
            label: item.device,
            value: item.clicks,
          }))}
          total={deviceTotal}
        />
      </div>
    </div>
  );
}
