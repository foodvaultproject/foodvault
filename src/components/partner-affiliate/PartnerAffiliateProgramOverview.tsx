"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/affiliate/format";
import {
  buildPartnerProgramHealth,
  formatPartnerDate,
  formatPartnerDateTime,
  type PartnerAffiliateProgramStatus,
  type SectionHealthLevel,
} from "@/lib/partner-affiliate/program-status";
import type { PartnerAffiliateTab } from "@/lib/partner-affiliate/paths";
import {
  portalCard,
  portalCardTitle,
  portalHelper,
  portalMetricValue,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";

type PartnerAffiliateProgramOverviewProps = {
  status: PartnerAffiliateProgramStatus;
  onNavigateTab: (tab: PartnerAffiliateTab) => void;
};

const OVERALL_STYLES = {
  healthy: {
    emoji: "🟢",
    card: "border-emerald-200 bg-emerald-50",
    score: "text-emerald-700",
  },
  attention: {
    emoji: "🟡",
    card: "border-amber-200 bg-amber-50",
    score: "text-amber-700",
  },
  action_required: {
    emoji: "🔴",
    card: "border-red-200 bg-red-50",
    score: "text-red-700",
  },
};

const SECTION_STYLES: Record<
  SectionHealthLevel,
  { emoji: string; badge: string }
> = {
  healthy: {
    emoji: "🟢",
    badge: "bg-emerald-100 text-emerald-800",
  },
  warning: {
    emoji: "🟡",
    badge: "bg-amber-100 text-amber-800",
  },
  action_required: {
    emoji: "🔴",
    badge: "bg-red-100 text-red-800",
  },
};

function StatusSection({
  title,
  statusLabel,
  level,
  children,
}: {
  title: string;
  statusLabel: string;
  level: SectionHealthLevel;
  children: React.ReactNode;
}) {
  const styles = SECTION_STYLES[level];

  return (
    <section className={portalCard}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={portalSectionTitle}>{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {styles.emoji} {statusLabel}
          </p>
        </div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>
          {statusLabel}
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReconnectShopifyButton() {
  const [shop, setShop] = useState("");

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="text-sm font-medium text-foreground">Shopify store address</label>
        <input
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          placeholder="your-brand.myshopify.com"
          className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          if (!shop.trim()) return;
          window.location.href = `/api/integrations/shopify/connect?shop=${encodeURIComponent(shop.trim())}`;
        }}
        className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
      >
        Reconnect Shopify
      </button>
    </div>
  );
}

export function PartnerAffiliateProgramOverview({
  status,
  onNavigateTab,
}: PartnerAffiliateProgramOverviewProps) {
  const health = useMemo(() => buildPartnerProgramHealth(status), [status]);
  const overall = OVERALL_STYLES[health.overallLevel];

  return (
    <div className="space-y-5">
      <section className={`${portalCard} px-5 py-4 ${overall.card}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
              Overall Program Status
            </p>
            <h2 className={`${portalSectionTitle} mt-1`}>
              {overall.emoji} {health.overallTitle}
            </h2>
            <p className={`${portalHelper} mt-1 max-w-2xl`}>
              {health.overallDescription}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
              Program Health Score
            </p>
            <p className={`${portalMetricValue} mt-1 ${overall.score}`}>
              {health.healthScore}% Healthy
            </p>
          </div>
        </div>
      </section>

      {health.issues.length > 0 ? (
        <section className="space-y-4">
          <h2 className={portalSectionTitle}>Issues Requiring Attention</h2>
          {health.issues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
            >
              <h3 className={portalCardTitle}>⚠ {issue.title}</h3>
              <p className={`${portalHelper} mt-1`}>{issue.description}</p>
              <button
                type="button"
                onClick={() => onNavigateTab(issue.actionTab)}
                className="fv-btn-primary mt-4 inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
              >
                {issue.actionLabel}
              </button>
            </div>
          ))}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusSection
          title="Shopify Connection"
          statusLabel={health.sectionLabels.shopify}
          level={health.sections.shopify}
        >
          <DetailGrid
            items={[
              {
                label: "Connection Status",
                value: status.shopify.connected ? "Connected" : "Not Connected",
              },
              {
                label: "Store URL",
                value: status.shopify.storeUrl ?? "Not connected",
              },
              {
                label: "Connected Since",
                value: formatPartnerDate(status.shopify.connectedAt),
              },
              {
                label: "Last Successful Connection",
                value: formatPartnerDateTime(status.shopify.lastSuccessfulConnection),
              },
            ]}
          />
          {!status.shopify.connected ? <ReconnectShopifyButton /> : null}
        </StatusSection>

        <StatusSection
          title="Affiliate Tracking"
          statusLabel={health.sectionLabels.tracking}
          level={health.sections.tracking}
        >
          <DetailGrid
            items={[
              {
                label: "Tracking Status",
                value: health.sectionLabels.tracking,
              },
              {
                label: "Latest Referral Click",
                value: formatPartnerDateTime(status.tracking.latestClickAt),
              },
              {
                label: "Latest Tracked Affiliate Sale",
                value: formatPartnerDateTime(status.tracking.latestSaleAt),
              },
            ]}
          />
          {health.sections.tracking === "action_required" ? (
            <button
              type="button"
              onClick={() => onNavigateTab("integration")}
              className="mt-5 fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
            >
              Complete Setup
            </button>
          ) : null}
        </StatusSection>

        <StatusSection
          title="Affiliate Orders"
          statusLabel={health.sectionLabels.affiliateOrders}
          level={health.sections.affiliateOrders}
        >
          <p className="mb-4 text-sm text-muted-foreground">
            These figures include only sales that came through your FoodVault Affiliate Program —
            not every order in your Shopify store.
          </p>
          <DetailGrid
            items={[
              {
                label: "Affiliate Orders Today",
                value: String(status.affiliateOrders.ordersToday),
              },
              {
                label: "Total Affiliate Orders",
                value: String(status.affiliateOrders.totalOrders),
              },
              {
                label: "Last Affiliate Order",
                value: formatPartnerDateTime(status.affiliateOrders.lastOrderAt),
              },
              {
                label: "Last Successful Sync",
                value: formatPartnerDateTime(status.affiliateOrders.lastSyncAt),
              },
            ]}
          />
        </StatusSection>

        <StatusSection
          title="Commissions"
          statusLabel={health.sectionLabels.commissions}
          level={health.sections.commissions}
        >
          <DetailGrid
            items={[
              {
                label: "Pending Commissions",
                value: formatCurrency(status.commissions.pending),
              },
              {
                label: "Approved Commissions",
                value: formatCurrency(status.commissions.approved),
              },
              {
                label: "Paid Commissions",
                value: formatCurrency(status.commissions.paid),
              },
              {
                label: "Total Commission Value",
                value: formatCurrency(status.commissions.total),
              },
            ]}
          />
        </StatusSection>

        <StatusSection
          title="Payouts"
          statusLabel={health.sectionLabels.payouts}
          level={health.sections.payouts}
        >
          <DetailGrid
            items={[
              {
                label: "Next Scheduled Payout",
                value: formatPartnerDate(status.payouts.nextScheduledAt),
              },
              {
                label: "Pending Payouts",
                value:
                  status.payouts.pendingCount > 0
                    ? `${status.payouts.pendingCount} (${formatCurrency(status.payouts.pendingAmount)})`
                    : "None",
              },
              {
                label: "Total Paid to Affiliates",
                value: formatCurrency(status.payouts.totalPaid),
              },
            ]}
          />
        </StatusSection>

        <StatusSection
          title="Billing"
          statusLabel={health.sectionLabels.billing}
          level={health.sections.billing}
        >
          <DetailGrid
            items={[
              {
                label: "Current Account Status",
                value: health.sectionLabels.billing,
              },
              {
                label: "Next Billing Date",
                value: formatPartnerDate(status.billing.nextBillingDate),
              },
              {
                label: "Outstanding Balance",
                value:
                  status.billing.outstandingBalance > 0
                    ? formatCurrency(status.billing.outstandingBalance)
                    : "None",
              },
            ]}
          />
          {health.sections.billing === "warning" ? (
            <button
              type="button"
              onClick={() => onNavigateTab("billing")}
              className="mt-5 fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
            >
              Update Payment Method
            </button>
          ) : null}
        </StatusSection>
      </div>

      <section className={portalCard}>
        <h2 className={portalSectionTitle}>Recent Activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A snapshot of recent activity across your affiliate program.
        </p>
        {status.recentActivity.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Activity will appear here once affiliates join, referral links are clicked, or affiliate
            sales are recorded.
          </p>
        ) : (
          <ol className="mt-6 space-y-4">
            {status.recentActivity.map((item, index) => (
              <li key={`${item.activityType}-${item.occurredAt}-${index}`} className="flex gap-4">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPartnerDateTime(item.occurredAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
