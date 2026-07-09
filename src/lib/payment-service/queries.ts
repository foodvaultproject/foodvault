import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth";
import type {
  AffiliatePayoutAccount,
  PartnerBillingProfile,
  PayoutHistoryItem,
} from "@/lib/payment-service/types";

export async function getAffiliatePayoutAccount(
  affiliateId: string
): Promise<AffiliatePayoutAccount> {
  if (!isSupabaseConfigured()) {
    return { connected: false };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_affiliate_payout_account", {
    p_affiliate_id: affiliateId,
  });

  if (error || !data) {
    return { connected: false };
  }

  const row = data as Record<string, unknown>;
  return {
    connected: Boolean(row.connected),
    provider: row.provider as AffiliatePayoutAccount["provider"],
    onboardingStatus: row.onboarding_status as AffiliatePayoutAccount["onboardingStatus"],
    payoutsEnabled: Boolean(row.payouts_enabled),
    detailsSubmitted: Boolean(row.details_submitted),
    defaultCurrency: (row.default_currency as string) ?? "NZD",
    updatedAt: (row.updated_at as string) ?? undefined,
  };
}

export async function getPartnerBillingProfile(
  partnerId: string
): Promise<PartnerBillingProfile> {
  if (!isSupabaseConfigured()) {
    return { configured: false };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_billing_profile", {
    p_partner_id: partnerId,
  });

  if (error || !data) {
    return { configured: false };
  }

  const row = data as Record<string, unknown>;
  return {
    configured: Boolean(row.configured),
    provider: row.provider as PartnerBillingProfile["provider"],
    billingStatus: row.billing_status as PartnerBillingProfile["billingStatus"],
    hasPaymentMethod: Boolean(row.has_payment_method),
    updatedAt: (row.updated_at as string) ?? undefined,
  };
}

export async function getAffiliatePayoutHistory(
  affiliateId: string
): Promise<PayoutHistoryItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_affiliate_payout_history", {
    p_affiliate_id: affiliateId,
    p_limit: 20,
  });

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? "NZD"),
    status: String(row.status ?? "pending"),
    paidAt: (row.paid_at as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    periodStart: String(row.period_start ?? ""),
    periodEnd: String(row.period_end ?? ""),
  }));
}
