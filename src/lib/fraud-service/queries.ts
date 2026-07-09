import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth";

export type FraudFlagRow = {
  id: string;
  flagType: string;
  status: string;
  clickCount: number | null;
  ipHash: string | null;
  createdAt: string;
  reviewedAt: string | null;
  affiliateFirstName: string | null;
  affiliateLastName: string | null;
  affiliateEmail: string | null;
  brandName: string | null;
  affiliateId: string | null;
  partnerId: string | null;
};

export async function getAdminFraudFlags(status?: string): Promise<FraudFlagRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_get_fraud_flags", {
    p_status: status ?? null,
    p_limit: 100,
  });

  if (error || !data) return [];

  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    flagType: String(row.flag_type ?? ""),
    status: String(row.status ?? "open"),
    clickCount: row.click_count != null ? Number(row.click_count) : null,
    ipHash: (row.ip_hash as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    affiliateFirstName: (row.affiliate_first_name as string | null) ?? null,
    affiliateLastName: (row.affiliate_last_name as string | null) ?? null,
    affiliateEmail: (row.affiliate_email as string | null) ?? null,
    brandName: (row.brand_name as string | null) ?? null,
    affiliateId: (row.affiliate_id as string | null) ?? null,
    partnerId: (row.partner_id as string | null) ?? null,
  }));
}

export async function updateAdminFraudFlagStatus(
  flagId: string,
  status: "dismissed" | "investigated",
  notes?: string
) {
  if (!isSupabaseConfigured()) return { error: "Not configured" };

  const supabase = createClient();
  const { error } = await supabase.rpc("admin_update_fraud_flag_status", {
    p_flag_id: flagId,
    p_status: status,
    p_notes: notes ?? null,
  });

  if (error) return { error: error.message };
  return {};
}
