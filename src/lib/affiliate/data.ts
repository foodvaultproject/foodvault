import { createClient } from "@/lib/supabase/client";
import { getAuthSession, isSupabaseConfigured } from "@/lib/auth";
import { formatBusinessName } from "@/lib/business-name";
import { parseLogoCrop } from "@/lib/partner-logo-crop";
import { buildReferralUrl } from "@/lib/affiliate/links";
import type {
  AdminAffiliateBrandRow,
  AdminAffiliateRow,
  AdminAffiliateStats,
  AffiliateClickEvent,
  AffiliateDashboardStats,
  AffiliateParticipatingBrand,
  AffiliateRecord,
  AffiliateReferralLink,
  AffiliateSettingsInput,
} from "@/lib/affiliate/types";

const DEV_AFFILIATE_PREFIX = "foodvault-affiliate-record";

function mapAffiliateRow(row: Record<string, unknown>): AffiliateRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    country: String(row.country ?? "New Zealand"),
    paymentCountry: String(row.payment_country ?? "New Zealand"),
    bankAccountName: String(row.bank_account_name ?? ""),
    bankAccountNumber: String(row.bank_account_number ?? ""),
    taxNumber: (row.tax_number as string | null) ?? null,
    referralCode: String(row.referral_code ?? ""),
    status: String(row.status ?? "ACTIVE"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapReferralLink(row: Record<string, unknown>): AffiliateReferralLink {
  const linkPath = String(row.link_path ?? "");
  return {
    id: String(row.id),
    affiliateId: String(row.affiliate_id),
    partnerId: String(row.partner_id),
    linkPath,
    url: buildReferralUrl(linkPath),
  };
}

function readDevAffiliate(userId: string): AffiliateRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${DEV_AFFILIATE_PREFIX}:${userId}`);
    if (!raw) return null;
    const row = JSON.parse(raw) as Record<string, unknown>;
    return {
      id: "dev-affiliate-1",
      userId,
      firstName: String(row.first_name ?? "Demo"),
      lastName: String(row.last_name ?? "Affiliate"),
      email: String(row.email ?? "affiliate@example.com"),
      country: "New Zealand",
      paymentCountry: "New Zealand",
      bankAccountName: "Demo Account",
      bankAccountNumber: "12-3456-7890123-00",
      taxNumber: null,
      referralCode: String(row.referral_code ?? "DEVAFF01"),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getAffiliateRecord(userId: string): Promise<AffiliateRecord | null> {
  if (!isSupabaseConfigured()) {
    return readDevAffiliate(userId);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapAffiliateRow(data as Record<string, unknown>);
}

export async function registerAffiliateProfile(input: {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
}) {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("register_affiliate", {
    p_first_name: input.firstName.trim(),
    p_last_name: input.lastName.trim(),
    p_email: input.email.trim(),
    p_country: input.country.trim() || "New Zealand",
    p_payment_country: input.country.trim() || "New Zealand",
    p_bank_account_name: null,
    p_bank_account_number: null,
    p_tax_number: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateAffiliateSettings(
  userId: string,
  input: AffiliateSettingsInput
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("affiliates")
    .update({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      country: input.country.trim() || "New Zealand",
      payment_country: input.paymentCountry.trim() || "New Zealand",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function fetchReferralLinks(affiliateId: string): Promise<AffiliateReferralLink[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "dev-link-1",
        affiliateId,
        partnerId: "dev-partner-1",
        linkPath: "demo-brand/DEVAFF01",
        url: buildReferralUrl("demo-brand/DEVAFF01"),
      },
    ];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("affiliate_referral_links")
    .select("id, affiliate_id, partner_id, link_path")
    .eq("affiliate_id", affiliateId);

  return (data ?? []).map((row) => mapReferralLink(row as Record<string, unknown>));
}

export async function getAffiliateParticipatingBrands(
  affiliateId: string
): Promise<AffiliateParticipatingBrand[]> {
  const links = await fetchReferralLinks(affiliateId);
  const linksByPartner = new Map(links.map((link) => [link.partnerId, link]));

  if (!isSupabaseConfigured()) {
    return [
      {
        id: "dev-partner-1",
        slug: "demo-brand",
        businessName: "Demo Brand",
        shortDescription: "A participating FoodVault brand.",
        logoUrl: null,
        logoOriginalUrl: null,
        logoCrop: null,
        commissionPercent: 10,
        cookieDurationDays: 30,
        programDescription: "Earn commission by referring customers.",
        affiliateTerms: null,
        websiteUrl: "https://example.com",
        referralLink: linksByPartner.get("dev-partner-1") ?? links[0] ?? null,
      },
    ];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_affiliate_participating_brands")
    .select("*")
    .order("business_name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const record = row as Record<string, unknown>;
    const partnerId = String(record.id);
    return {
      id: partnerId,
      slug: String(record.slug ?? ""),
      businessName: formatBusinessName(String(record.business_name ?? "")),
      shortDescription: (record.short_description as string | null) ?? null,
      logoUrl: (record.logo_url as string | null) ?? null,
      logoOriginalUrl: (record.logo_original_url as string | null) ?? null,
      logoCrop: parseLogoCrop(record.logo_crop),
      commissionPercent: (record.affiliate_commission_percent as number | null) ?? null,
      cookieDurationDays: (record.affiliate_cookie_duration_days as number | null) ?? null,
      programDescription: (record.affiliate_program_description as string | null) ?? null,
      affiliateTerms: (record.affiliate_terms as string | null) ?? null,
      websiteUrl: (record.website_url as string | null) ?? null,
      referralLink: linksByPartner.get(partnerId) ?? null,
    };
  });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function getAffiliateDashboardStats(
  affiliateId: string
): Promise<AffiliateDashboardStats> {
  const brands = await getAffiliateParticipatingBrands(affiliateId);
  const links = await fetchReferralLinks(affiliateId);

  const placeholder = {
    totalSales: 0,
    totalOrders: 0,
    pendingEarnings: 0,
    approvedEarnings: 0,
    paidEarnings: 0,
  };

  if (!isSupabaseConfigured()) {
    return {
      participatingBrands: brands.length,
      referralLinks: links.length,
      totalClicks: 0,
      clicksToday: 0,
      clicksLast7Days: 0,
      clicksLast30Days: 0,
      recentClicks: [],
      ...placeholder,
    };
  }

  const supabase = createClient();
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: clicks } = await supabase
    .from("affiliate_click_events")
    .select("id, partner_id, clicked_at, device, referrer")
    .eq("affiliate_id", affiliateId)
    .order("clicked_at", { ascending: false });

  const clickRows = clicks ?? [];
  const partnerIds = [...new Set(clickRows.map((row) => String(row.partner_id)))];

  let partnerNames = new Map<string, string>();
  if (partnerIds.length > 0) {
    const { data: partners } = await supabase
      .from("partners")
      .select("id, business_name")
      .in("id", partnerIds);

    partnerNames = new Map(
      (partners ?? []).map((partner) => [
        String(partner.id),
        formatBusinessName(String(partner.business_name ?? "Brand")),
      ])
    );
  }

  const recentClicks: AffiliateClickEvent[] = clickRows.slice(0, 10).map((row) => ({
    id: String(row.id),
    partnerId: String(row.partner_id),
    brandName: partnerNames.get(String(row.partner_id)) ?? "Brand",
    clickedAt: String(row.clicked_at),
    device: (row.device as string | null) ?? null,
    referrer: (row.referrer as string | null) ?? null,
  }));

  const toTime = (value: string) => new Date(value).getTime();

  const { data: earningsData } = await supabase.rpc("get_affiliate_earnings_stats", {
    p_affiliate_id: affiliateId,
  });
  const earnings = (earningsData as Record<string, unknown> | null) ?? {};

  return {
    participatingBrands: brands.length,
    referralLinks: links.length,
    totalClicks: clickRows.length,
    clicksToday: clickRows.filter((row) => toTime(String(row.clicked_at)) >= todayStart.getTime())
      .length,
    clicksLast7Days: clickRows.filter((row) => toTime(String(row.clicked_at)) >= sevenDaysAgo.getTime())
      .length,
    clicksLast30Days: clickRows.filter(
      (row) => toTime(String(row.clicked_at)) >= thirtyDaysAgo.getTime()
    ).length,
    recentClicks,
    totalSales: Number(earnings.total_sales ?? 0),
    totalOrders: Number(earnings.total_orders ?? 0),
    pendingEarnings: Number(earnings.pending_earnings ?? 0),
    approvedEarnings: Number(earnings.approved_earnings ?? 0),
    paidEarnings: Number(earnings.paid_earnings ?? 0),
  };
}

export async function getAffiliateReferralLinkForBrand(
  affiliateId: string,
  partnerId: string
): Promise<AffiliateReferralLink | null> {
  const links = await fetchReferralLinks(affiliateId);
  return links.find((link) => link.partnerId === partnerId) ?? null;
}

export async function getCurrentAffiliateRecord(): Promise<AffiliateRecord | null> {
  const session = await getAuthSession();
  if (!session) return null;
  return getAffiliateRecord(session.id);
}

export async function getAdminAffiliateStats(): Promise<AdminAffiliateStats> {
  if (!isSupabaseConfigured()) {
    return {
      totalAffiliates: 0,
      participatingBrands: 0,
      referralLinksGenerated: 0,
      totalClicks: 0,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_affiliate_stats");
  if (error || !data) {
    return {
      totalAffiliates: 0,
      participatingBrands: 0,
      referralLinksGenerated: 0,
      totalClicks: 0,
    };
  }

  const row = data as Record<string, unknown>;
  return {
    totalAffiliates: Number(row.total_affiliates ?? 0),
    participatingBrands: Number(row.participating_brands ?? 0),
    referralLinksGenerated: Number(row.referral_links_generated ?? 0),
    totalClicks: Number(row.total_clicks ?? 0),
  };
}

export async function getAdminAffiliates(search?: string): Promise<AdminAffiliateRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_list_affiliates", {
    p_search: search ?? null,
  });

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    referralCode: String(row.referral_code ?? ""),
    country: String(row.country ?? ""),
    status: String(row.status ?? ""),
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function getAdminAffiliateBrands(
  search?: string
): Promise<AdminAffiliateBrandRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_search_affiliate_brands", {
    p_search: search ?? null,
  });

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    businessName: (row.business_name as string | null) ?? null,
    slug: (row.slug as string | null) ?? null,
    affiliateCommissionPercent: (row.affiliate_commission_percent as number | null) ?? null,
    affiliateEnabled: Boolean(row.affiliate_enabled),
  }));
}
