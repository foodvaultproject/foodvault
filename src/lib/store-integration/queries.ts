import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth";
import { formatBusinessName } from "@/lib/business-name";
import type {
  AdminAffiliateTransactionRow,
  AdminAffiliateTransactionSummary,
  AffiliateOrderRow,
  CommissionStatus,
  PartnerAffiliateOrderRow,
  PartnerStoreIntegration,
} from "@/lib/store-integration/types";

export async function getPartnerStoreIntegration(
  partnerId: string
): Promise<PartnerStoreIntegration> {
  if (!isSupabaseConfigured()) {
    return { connected: false };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_store_integration", {
    p_partner_id: partnerId,
  });

  if (error || !data) {
    return { connected: false };
  }

  const row = data as Record<string, unknown>;
  return {
    connected: Boolean(row.connected),
    platform: (row.platform as PartnerStoreIntegration["platform"]) ?? undefined,
    storeName: (row.store_name as string) ?? undefined,
    storeUrl: (row.store_url as string | null) ?? null,
    externalStoreId: (row.external_store_id as string) ?? undefined,
    status: (row.status as PartnerStoreIntegration["status"]) ?? undefined,
    connectedAt: (row.connected_at as string) ?? undefined,
    disconnectedAt: (row.disconnected_at as string | null) ?? null,
    lastSyncAt: (row.last_sync_at as string | null) ?? null,
  };
}

export async function getPartnerAffiliateOrders(
  partnerId: string,
  options: { search?: string; status?: string; sort?: string } = {}
): Promise<PartnerAffiliateOrderRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_affiliate_orders", {
    p_partner_id: partnerId,
    p_search: options.search ?? null,
    p_status: options.status ?? null,
    p_sort: options.sort ?? "newest",
  });

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    orderId: String(row.order_id),
    orderNumber: String(row.order_number ?? ""),
    orderDate: String(row.order_date ?? ""),
    grossTotal: Number(row.gross_total ?? 0),
    currency: String(row.currency ?? "NZD"),
    commissionId: row.commission_id ? String(row.commission_id) : null,
    commissionPercent: row.commission_percent != null ? Number(row.commission_percent) : null,
    commissionValue: row.commission_value != null ? Number(row.commission_value) : null,
    commissionStatus: (row.commission_status as CommissionStatus | null) ?? null,
    affiliateId: row.affiliate_id ? String(row.affiliate_id) : null,
    affiliateName: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
  }));
}

export async function getAffiliateRecentOrders(
  affiliateId: string
): Promise<AffiliateOrderRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_affiliate_recent_orders", {
    p_affiliate_id: affiliateId,
    p_limit: 20,
  });

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    commissionId: String(row.commission_id),
    orderNumber: String(row.order_number ?? ""),
    orderDate: String(row.order_date ?? ""),
    grossTotal: Number(row.gross_total ?? 0),
    commissionPercent: Number(row.commission_percent ?? 0),
    commissionValue: Number(row.commission_value ?? 0),
    currency: String(row.currency ?? "NZD"),
    status: String(row.status ?? "pending") as CommissionStatus,
    brandName: formatBusinessName(String(row.business_name ?? "Brand")),
    brandSlug: (row.slug as string | null) ?? null,
  }));
}

export async function getAffiliateEarningsStats(affiliateId: string) {
  if (!isSupabaseConfigured()) {
    return {
      totalSales: 0,
      totalOrders: 0,
      pendingEarnings: 0,
      approvedEarnings: 0,
      paidEarnings: 0,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_affiliate_earnings_stats", {
    p_affiliate_id: affiliateId,
  });

  if (error || !data) {
    return {
      totalSales: 0,
      totalOrders: 0,
      pendingEarnings: 0,
      approvedEarnings: 0,
      paidEarnings: 0,
    };
  }

  const row = data as Record<string, unknown>;
  return {
    totalSales: Number(row.total_sales ?? 0),
    totalOrders: Number(row.total_orders ?? 0),
    pendingEarnings: Number(row.pending_earnings ?? 0),
    approvedEarnings: Number(row.approved_earnings ?? 0),
    paidEarnings: Number(row.paid_earnings ?? 0),
  };
}

export async function getAdminAffiliateTransactions(options: {
  search?: string;
  status?: string;
}): Promise<{
  summary: AdminAffiliateTransactionSummary;
  transactions: AdminAffiliateTransactionRow[];
}> {
  const empty = {
    summary: {
      platformSales: 0,
      pendingCommission: 0,
      approvedCommission: 0,
      paidCommission: 0,
      refundedCommission: 0,
      cancelledCommission: 0,
    },
    transactions: [],
  };

  if (!isSupabaseConfigured()) {
    return empty;
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_affiliate_transactions", {
    p_search: options.search ?? null,
    p_status: options.status ?? null,
  });

  if (error || !data) {
    return empty;
  }

  const row = data as Record<string, unknown>;
  const summary = row.summary as Record<string, unknown>;

  return {
    summary: {
      platformSales: Number(summary.platform_sales ?? 0),
      pendingCommission: Number(summary.pending_commission ?? 0),
      approvedCommission: Number(summary.approved_commission ?? 0),
      paidCommission: Number(summary.paid_commission ?? 0),
      refundedCommission: Number(summary.refunded_commission ?? 0),
      cancelledCommission: Number(summary.cancelled_commission ?? 0),
    },
    transactions: ((row.transactions as Record<string, unknown>[]) ?? []).map((item) => ({
      id: String(item.id),
      orderNumber: String(item.order_number ?? ""),
      orderDate: String(item.order_date ?? ""),
      grossSale: Number(item.gross_sale ?? 0),
      commissionValue: Number(item.commission_value ?? 0),
      currency: String(item.currency ?? "NZD"),
      status: String(item.status ?? "pending") as CommissionStatus,
      reviewRequired: Boolean(item.review_required),
      businessName: formatBusinessName(String(item.business_name ?? "")),
      brandSlug: (item.slug as string | null) ?? null,
      affiliateName: `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim(),
      affiliateEmail: String(item.email ?? ""),
      platform: (item.platform as AdminAffiliateTransactionRow["platform"]) ?? null,
    })),
  };
}
