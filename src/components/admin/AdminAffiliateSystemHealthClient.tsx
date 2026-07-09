"use client";

import type { HealthStatus, PlatformHealthDashboard } from "@/lib/admin/platform-health";

type AdminAffiliateSystemHealthClientProps = {
  dashboard: PlatformHealthDashboard;
};

const STATUS_META: Record<
  HealthStatus,
  { label: string; dot: string; card: string }
> = {
  healthy: {
    label: "Healthy",
    dot: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50",
  },
  warning: {
    label: "Warning",
    dot: "bg-amber-500",
    card: "border-amber-200 bg-amber-50",
  },
  action_required: {
    label: "Action Required",
    dot: "bg-red-500",
    card: "border-red-200 bg-red-50",
  },
};

function StatusBadge({ status }: { status: HealthStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.card}`}>
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string | number;
  status?: HealthStatus;
}) {
  return (
    <div
      className={`rounded-lg border p-5 shadow-sm ${
        status ? STATUS_META[status].card : "border-border bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        {status ? <StatusBadge status={status} /> : null}
      </div>
      <p className="mt-2 text-2xl font-bold text-[#0f172a]">{value}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-NZ");
}

function formatJobStatus(status: string | null | undefined) {
  if (!status) return "—";
  return status;
}

export function AdminAffiliateSystemHealthClient({
  dashboard,
}: AdminAffiliateSystemHealthClientProps) {
  const webhookSuccessRate =
    dashboard.webhooks.total7d > 0
      ? `${(((dashboard.webhooks.total7d - dashboard.webhooks.failed7d) / dashboard.webhooks.total7d) * 100).toFixed(1)}%`
      : "—";

  const jobEntries = Object.entries(dashboard.scheduledJobs ?? {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Platform Health Dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          Real-time affiliate platform status across store integrations, payments, notifications,
          webhooks, scheduled jobs, and fraud monitoring.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Store Integration</h2>
          <StatusBadge status={dashboard.storeIntegration.shopifyApi} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Connected Stores" value={dashboard.storeIntegration.connectedStores} />
          <MetricCard
            label="Failed Connections"
            value={dashboard.storeIntegration.failedConnections}
            status={
              dashboard.storeIntegration.failedConnections > 0 ? "warning" : undefined
            }
          />
          <MetricCard label="Shopify API" value={STATUS_META[dashboard.storeIntegration.shopifyApi].label} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Payments</h2>
          <StatusBadge status={dashboard.payments.stripe} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Pending Charges" value={dashboard.payments.pendingCharges} />
          <MetricCard
            label="Failed Charges"
            value={dashboard.payments.failedCharges}
            status={dashboard.payments.failedCharges > 0 ? "action_required" : undefined}
          />
          <MetricCard label="Stripe" value={STATUS_META[dashboard.payments.stripe].label} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Notifications</h2>
          <StatusBadge status={dashboard.notifications.status} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Queue Size" value={dashboard.notifications.queueSize} />
          <MetricCard label="Pending Emails" value={dashboard.notifications.pendingEmails} />
          <MetricCard
            label="Failed Emails"
            value={dashboard.notifications.failedEmails}
            status={dashboard.notifications.failedEmails > 0 ? "warning" : undefined}
          />
          <MetricCard label="Retry Queue" value={dashboard.notifications.failedEmails} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Webhooks</h2>
          <StatusBadge status={dashboard.webhooks.status} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Success Rate (7d)" value={webhookSuccessRate} />
          <MetricCard
            label="Failed Webhooks (7d)"
            value={dashboard.webhooks.failed7d}
            status={dashboard.webhooks.failed7d > 0 ? "warning" : undefined}
          />
          <MetricCard label="Last Successful Webhook" value={formatDate(dashboard.webhooks.lastSuccess)} />
          <MetricCard label="Retry Status" value={dashboard.webhooks.retryQueue} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Affiliate Platform</h2>
          <StatusBadge status={dashboard.affiliatePlatform.status} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pending Commissions" value={dashboard.affiliatePlatform.pendingCommissions} />
          <MetricCard label="Pending Payouts" value={dashboard.affiliatePlatform.pendingPayouts} />
          <MetricCard
            label="Open Fraud Flags"
            value={dashboard.affiliatePlatform.openFraudFlags}
            status={dashboard.affiliatePlatform.openFraudFlags > 0 ? "warning" : undefined}
          />
          <MetricCard label="System Alerts" value={dashboard.affiliatePlatform.openFraudFlags} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#0f172a]">Scheduled Jobs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Job</th>
                <th className="px-3 py-2">Last Run</th>
                <th className="px-3 py-2">Last Success</th>
                <th className="px-3 py-2">Last Failure</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted">
                    No scheduled job runs recorded yet.
                  </td>
                </tr>
              ) : (
                jobEntries.map(([jobName, job]) => {
                  const lastStatus = job.lastStatus as string | null | undefined;
                  const tone: HealthStatus =
                    lastStatus === "failed"
                      ? "action_required"
                      : lastStatus === "success"
                        ? "healthy"
                        : "warning";

                  return (
                    <tr key={jobName} className="border-b border-border/70">
                      <td className="px-3 py-3 font-medium text-[#0f172a]">{jobName}</td>
                      <td className="px-3 py-3 text-muted">{formatDate(job.lastRun as string | null)}</td>
                      <td className="px-3 py-3 text-muted">
                        {lastStatus === "success" ? formatDate(job.lastRun as string | null) : "—"}
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {lastStatus === "failed"
                          ? (job.lastError as string | null) ?? formatDate(job.lastRun as string | null)
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={tone} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          Frequent jobs run via Vercel Cron every 5 minutes. Monthly billing runs on the 1st at 04:00 UTC.
          Commission approval also runs daily via pg_cron when available.
        </p>
      </section>
    </div>
  );
}
