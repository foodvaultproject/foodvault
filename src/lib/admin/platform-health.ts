export type HealthStatus = "healthy" | "warning" | "action_required";

export type PlatformHealthDashboard = {
  storeIntegration: {
    connectedStores: number;
    failedConnections: number;
    shopifyApi: HealthStatus;
  };
  payments: {
    pendingCharges: number;
    failedCharges: number;
    stripe: HealthStatus;
  };
  notifications: {
    queueSize: number;
    failedEmails: number;
    pendingEmails: number;
    status: HealthStatus;
  };
  webhooks: {
    total7d: number;
    failed7d: number;
    lastSuccess: string | null;
    retryQueue: number;
    status: HealthStatus;
  };
  affiliatePlatform: {
    pendingCommissions: number;
    pendingPayouts: number;
    openFraudFlags: number;
    status: HealthStatus;
  };
  scheduledJobs: Record<string, {
    jobName?: string;
    lastRun?: string | null;
    lastStatus?: string | null;
    lastError?: string | null;
  }>;
};

export function mapPlatformHealth(data: unknown): PlatformHealthDashboard {
  const row = (data ?? {}) as Record<string, unknown>;
  const store = (row.store_integration ?? {}) as Record<string, unknown>;
  const payments = (row.payments ?? {}) as Record<string, unknown>;
  const notifications = (row.notifications ?? {}) as Record<string, unknown>;
  const webhooks = (row.webhooks ?? {}) as Record<string, unknown>;
  const affiliate = (row.affiliate_platform ?? {}) as Record<string, unknown>;
  const jobs = (row.scheduled_jobs ?? {}) as Record<string, Record<string, unknown>>;

  return {
    storeIntegration: {
      connectedStores: Number(store.connected_stores ?? 0),
      failedConnections: Number(store.failed_connections ?? 0),
      shopifyApi: (store.shopify_api as HealthStatus) ?? "healthy",
    },
    payments: {
      pendingCharges: Number(payments.pending_charges ?? 0),
      failedCharges: Number(payments.failed_charges ?? 0),
      stripe: (payments.stripe as HealthStatus) ?? "healthy",
    },
    notifications: {
      queueSize: Number(notifications.queue_size ?? 0),
      failedEmails: Number(notifications.failed_emails ?? 0),
      pendingEmails: Number(notifications.pending_emails ?? 0),
      status: (notifications.status as HealthStatus) ?? "healthy",
    },
    webhooks: {
      total7d: Number(webhooks.total_7d ?? 0),
      failed7d: Number(webhooks.failed_7d ?? 0),
      lastSuccess: (webhooks.last_success as string | null) ?? null,
      retryQueue: Number(webhooks.retry_queue ?? 0),
      status: (webhooks.status as HealthStatus) ?? "healthy",
    },
    affiliatePlatform: {
      pendingCommissions: Number(affiliate.pending_commissions ?? 0),
      pendingPayouts: Number(affiliate.pending_payouts ?? 0),
      openFraudFlags: Number(affiliate.open_fraud_flags ?? 0),
      status: (affiliate.status as HealthStatus) ?? "healthy",
    },
    scheduledJobs: jobs,
  };
}
