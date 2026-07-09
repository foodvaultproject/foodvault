import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth";
import type { PartnerBillingProfile } from "@/lib/payment-service/types";
import type { PartnerStoreIntegration } from "@/lib/store-integration/types";

export type ProgramHealthLevel = "healthy" | "attention" | "action_required";

export type SectionHealthLevel = "healthy" | "warning" | "action_required";

export type PartnerAffiliateProgramStatus = {
  enabled: boolean;
  shopify: {
    connected: boolean;
    status: string;
    storeUrl: string | null;
    storeName: string | null;
    connectedAt: string | null;
    lastSuccessfulConnection: string | null;
  };
  tracking: {
    latestClickAt: string | null;
    latestSaleAt: string | null;
    totalClicks: number;
  };
  affiliateOrders: {
    ordersToday: number;
    totalOrders: number;
    lastOrderAt: string | null;
    lastSyncAt: string | null;
  };
  commissions: {
    pending: number;
    approved: number;
    paid: number;
    total: number;
  };
  payouts: {
    nextScheduledAt: string | null;
    pendingCount: number;
    pendingAmount: number;
    totalPaid: number;
  };
  billing: {
    configured: boolean;
    billingStatus: PartnerBillingProfile["billingStatus"];
    hasPaymentMethod: boolean;
    nextBillingDate: string | null;
    outstandingBalance: number;
  };
  recentActivity: {
    activityType: string;
    label: string;
    occurredAt: string;
  }[];
};

export type PartnerProgramIssue = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionTab: "integration" | "billing";
};

export type PartnerProgramHealth = {
  overallLevel: ProgramHealthLevel;
  overallTitle: string;
  overallDescription: string;
  healthScore: number;
  sections: {
    shopify: SectionHealthLevel;
    tracking: SectionHealthLevel;
    affiliateOrders: SectionHealthLevel;
    commissions: SectionHealthLevel;
    payouts: SectionHealthLevel;
    billing: SectionHealthLevel;
  };
  sectionLabels: {
    shopify: string;
    tracking: string;
    affiliateOrders: string;
    commissions: string;
    payouts: string;
    billing: string;
  };
  issues: PartnerProgramIssue[];
};

const EMPTY_STATUS: PartnerAffiliateProgramStatus = {
  enabled: false,
  shopify: {
    connected: false,
    status: "not_connected",
    storeUrl: null,
    storeName: null,
    connectedAt: null,
    lastSuccessfulConnection: null,
  },
  tracking: {
    latestClickAt: null,
    latestSaleAt: null,
    totalClicks: 0,
  },
  affiliateOrders: {
    ordersToday: 0,
    totalOrders: 0,
    lastOrderAt: null,
    lastSyncAt: null,
  },
  commissions: {
    pending: 0,
    approved: 0,
    paid: 0,
    total: 0,
  },
  payouts: {
    nextScheduledAt: null,
    pendingCount: 0,
    pendingAmount: 0,
    totalPaid: 0,
  },
  billing: {
    configured: false,
    billingStatus: "none",
    hasPaymentMethod: false,
    nextBillingDate: null,
    outstandingBalance: 0,
  },
  recentActivity: [],
};

export async function getPartnerAffiliateProgramStatus(
  partnerId: string
): Promise<PartnerAffiliateProgramStatus> {
  if (!isSupabaseConfigured()) {
    return EMPTY_STATUS;
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_affiliate_program_status", {
    p_partner_id: partnerId,
  });

  if (error || !data) {
    return EMPTY_STATUS;
  }

  const row = data as Record<string, unknown>;
  if (!row.enabled) {
    return EMPTY_STATUS;
  }

  const shopify = (row.shopify ?? {}) as Record<string, unknown>;
  const tracking = (row.tracking ?? {}) as Record<string, unknown>;
  const affiliateOrders = (row.affiliate_orders ?? {}) as Record<string, unknown>;
  const commissions = (row.commissions ?? {}) as Record<string, unknown>;
  const payouts = (row.payouts ?? {}) as Record<string, unknown>;
  const billing = (row.billing ?? {}) as Record<string, unknown>;

  return {
    enabled: true,
    shopify: {
      connected: Boolean(shopify.connected),
      status: String(shopify.status ?? "not_connected"),
      storeUrl: (shopify.store_url as string | null) ?? null,
      storeName: (shopify.store_name as string | null) ?? null,
      connectedAt: (shopify.connected_at as string | null) ?? null,
      lastSuccessfulConnection: (shopify.last_successful_connection as string | null) ?? null,
    },
    tracking: {
      latestClickAt: (tracking.latest_click_at as string | null) ?? null,
      latestSaleAt: (tracking.latest_sale_at as string | null) ?? null,
      totalClicks: Number(tracking.total_clicks ?? 0),
    },
    affiliateOrders: {
      ordersToday: Number(affiliateOrders.orders_today ?? 0),
      totalOrders: Number(affiliateOrders.total_orders ?? 0),
      lastOrderAt: (affiliateOrders.last_order_at as string | null) ?? null,
      lastSyncAt: (affiliateOrders.last_sync_at as string | null) ?? null,
    },
    commissions: {
      pending: Number(commissions.pending ?? 0),
      approved: Number(commissions.approved ?? 0),
      paid: Number(commissions.paid ?? 0),
      total: Number(commissions.total ?? 0),
    },
    payouts: {
      nextScheduledAt: (payouts.next_scheduled_at as string | null) ?? null,
      pendingCount: Number(payouts.pending_count ?? 0),
      pendingAmount: Number(payouts.pending_amount ?? 0),
      totalPaid: Number(payouts.total_paid ?? 0),
    },
    billing: {
      configured: Boolean(billing.configured),
      billingStatus: (billing.billing_status as PartnerBillingProfile["billingStatus"]) ?? "none",
      hasPaymentMethod: Boolean(billing.has_payment_method),
      nextBillingDate: (billing.next_billing_date as string | null) ?? null,
      outstandingBalance: Number(billing.outstanding_balance ?? 0),
    },
    recentActivity: ((row.recent_activity as Record<string, unknown>[]) ?? []).map((item) => ({
      activityType: String(item.activity_type ?? ""),
      label: String(item.label ?? ""),
      occurredAt: String(item.occurred_at ?? ""),
    })),
  };
}

export function buildPartnerProgramHealth(
  status: PartnerAffiliateProgramStatus
): PartnerProgramHealth {
  const issues: PartnerProgramIssue[] = [];

  const shopifyLevel: SectionHealthLevel = status.shopify.connected ? "healthy" : "action_required";
  if (!status.shopify.connected) {
    issues.push({
      id: "shopify_disconnected",
      title: "Shopify has disconnected",
      description:
        "Affiliate sales cannot be tracked until your Shopify store is reconnected.",
      actionLabel: "Reconnect Shopify",
      actionTab: "integration",
    });
  }

  let trackingLevel: SectionHealthLevel = "healthy";
  let trackingLabel = "Tracking Active";
  if (!status.shopify.connected) {
    trackingLevel = "action_required";
    trackingLabel = "Tracking Not Configured";
  } else if (status.tracking.totalClicks === 0) {
    trackingLevel = "warning";
    trackingLabel = "Waiting for First Referral";
  } else if (status.tracking.totalClicks >= 20 && status.affiliateOrders.totalOrders === 0) {
    trackingLevel = "action_required";
    trackingLabel = "Tracking Not Configured";
    issues.push({
      id: "tracking_incomplete",
      title: "Affiliate tracking incomplete",
      description:
        "Referral clicks are being recorded, but affiliate sales are not yet appearing. Complete the Shopify attribution setup to begin tracking affiliate sales.",
      actionLabel: "Complete Setup",
      actionTab: "integration",
    });
  }

  let affiliateOrdersLevel: SectionHealthLevel = "healthy";
  let affiliateOrdersLabel = "Receiving Affiliate Orders";
  if (!status.shopify.connected || status.shopify.status === "error") {
    affiliateOrdersLevel = "action_required";
    affiliateOrdersLabel = "Unable to Receive Affiliate Orders";
  } else if (status.affiliateOrders.totalOrders === 0) {
    affiliateOrdersLevel = "warning";
    affiliateOrdersLabel = "No Affiliate Orders Yet";
  }

  const commissionsLevel: SectionHealthLevel =
    shopifyLevel === "action_required" ? "action_required" : "healthy";
  const commissionsLabel = "Operating Normally";

  let payoutsLevel: SectionHealthLevel = "healthy";
  let payoutsLabel = "On Schedule";
  if (status.billing.billingStatus === "past_due" || status.billing.outstandingBalance > 0) {
    payoutsLevel = "warning";
    payoutsLabel = "Action Required";
  }

  let billingLevel: SectionHealthLevel = "healthy";
  let billingLabel = "Up to Date";
  if (
    !status.billing.hasPaymentMethod ||
    status.billing.billingStatus === "past_due" ||
    status.billing.outstandingBalance > 0
  ) {
    billingLevel = "warning";
    billingLabel = "Payment Required";
    if (status.billing.outstandingBalance > 0 || status.billing.billingStatus === "past_due") {
      issues.push({
        id: "billing_issue",
        title: "Billing issue",
        description:
          "Your latest invoice could not be processed. Update your payment method to keep affiliate payouts on schedule.",
        actionLabel: "Update Payment Method",
        actionTab: "billing",
      });
    } else if (!status.billing.hasPaymentMethod) {
      issues.push({
        id: "billing_setup",
        title: "Payment method required",
        description:
          "Add a payment method so FoodVault can bill approved affiliate commissions each month.",
        actionLabel: "Add Payment Method",
        actionTab: "billing",
      });
    }
  }

  const sections = {
    shopify: shopifyLevel,
    tracking: trackingLevel,
    affiliateOrders: affiliateOrdersLevel,
    commissions: commissionsLevel,
    payouts: payoutsLevel,
    billing: billingLevel,
  };

  const scores = Object.values(sections).map(sectionScore);
  const healthScore = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);

  const hasActionRequired = Object.values(sections).some((level) => level === "action_required");
  const hasWarning = Object.values(sections).some((level) => level === "warning");

  let overallLevel: ProgramHealthLevel = "healthy";
  let overallTitle = "Affiliate Program Active";
  let overallDescription = "Everything is operating normally.";

  if (hasActionRequired) {
    overallLevel = "action_required";
    overallTitle = "Action Required";
    overallDescription =
      "Important issues are preventing your affiliate program from operating correctly.";
  } else if (hasWarning) {
    overallLevel = "attention";
    overallTitle = "Attention Required";
    overallDescription = "Some parts of your affiliate program require attention.";
  }

  return {
    overallLevel,
    overallTitle,
    overallDescription,
    healthScore,
    sections,
    sectionLabels: {
      shopify: status.shopify.connected ? "Connected" : "Not Connected",
      tracking: trackingLabel,
      affiliateOrders: affiliateOrdersLabel,
      commissions: commissionsLabel,
      payouts: payoutsLabel,
      billing: billingLabel,
    },
    issues,
  };
}

export function formatPartnerDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatPartnerDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function toStoreIntegration(status: PartnerAffiliateProgramStatus): PartnerStoreIntegration {
  return {
    connected: status.shopify.connected,
    platform: "shopify",
    storeName: status.shopify.storeName ?? undefined,
    storeUrl: status.shopify.storeUrl,
    status: status.shopify.connected
      ? "connected"
      : status.shopify.status === "disconnected" || status.shopify.status === "paused"
        ? status.shopify.status
        : undefined,
    connectedAt: status.shopify.connectedAt ?? undefined,
    lastSyncAt: status.affiliateOrders.lastSyncAt,
  };
}

export type AffiliateSetupTask = {
  id: string;
  label: string;
  description: string;
  href: string;
  complete: boolean;
};

export function getAffiliateSetupTasks(
  status: PartnerAffiliateProgramStatus
): AffiliateSetupTask[] {
  return [
    {
      id: "shopify",
      label: "Connect Shopify",
      description:
        "Link your Shopify store so FoodVault can track affiliate referral sales.",
      href: "/partner/affiliate-program?tab=integration",
      complete: status.shopify.connected,
    },
    {
      id: "billing",
      label: "Add payment method",
      description:
        "Add a billing payment method so FoodVault can invoice approved affiliate commissions each month.",
      href: "/partner/affiliate-program?tab=billing",
      complete: status.billing.hasPaymentMethod,
    },
  ];
}

export function isAffiliateProgramSetupComplete(
  status: PartnerAffiliateProgramStatus
): boolean {
  if (!status.enabled) {
    return true;
  }

  return getAffiliateSetupTasks(status).every((task) => task.complete);
}

function sectionScore(level: SectionHealthLevel): number {
  if (level === "healthy") return 100;
  if (level === "warning") return 60;
  return 0;
}
