import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth";
import { formatBusinessName } from "@/lib/business-name";
import { buildReferralUrl } from "@/lib/affiliate/links";

export type PartnerAffiliateProgram = {
  id: string;
  slug: string;
  businessName: string;
  affiliateEnabled: boolean;
  commissionPercent: number | null;
  cookieDurationDays: number | null;
};

export type PartnerAffiliateOverview = {
  enabled: boolean;
  totalAffiliates: number;
  referralLinks: number;
  totalClicks: number;
  clicksThisMonth: number;
  clicksThisWeek: number;
  clicksToday: number;
  estimatedSales: number;
  estimatedCommission: number;
  affiliateOrders: number;
  conversionRate: number;
  averageOrderValue: number;
};

export type PartnerAffiliateDirectoryRow = {
  affiliateId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  country: string;
  status: string;
  joinedAt: string;
  linkPath: string;
  referralUrl: string;
  totalClicks: number;
  estimatedSales: number;
  estimatedCommission: number;
};

export type PartnerAffiliateDetail = {
  affiliateId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  country: string;
  status: string;
  joinedAt: string;
  linkPath: string;
  referralUrl: string;
  totalClicks: number;
  recentActivity: {
    clickedAt: string;
    device: string | null;
    referrer: string | null;
  }[];
};

export type PartnerAffiliateAnalytics = {
  clicksToday: number;
  clicks7Days: number;
  clicks30Days: number;
  clicksAllTime: number;
  dailyClicks: { day: string; clicks: number }[];
  monthlyClicks: { month: string; clicks: number }[];
  topReferrers: { source: string; clicks: number }[];
  topDevices: { device: string; clicks: number }[];
};

export type PartnerReferralLinkRow = {
  linkId: string;
  linkPath: string;
  referralUrl: string;
  createdAt: string;
  clicks: number;
  affiliateId: string;
  affiliateName: string;
};

export type PartnerAffiliateInsight =
  | "no_affiliates"
  | "no_clicks"
  | "high_clicks_no_sales"
  | "growing";

export type AdminAffiliateAnalytics = {
  participatingBrands: number;
  totalAffiliates: number;
  referralLinks: number;
  totalClicks: number;
  topBrands: {
    id: string;
    businessName: string;
    slug: string | null;
    clicks: number;
  }[];
  topAffiliates: {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    clicks: number;
  }[];
  newestAffiliates: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    createdAt: string;
  }[];
  newestPrograms: {
    id: string;
    businessName: string;
    slug: string | null;
    commissionPercent: number | null;
    createdAt: string | null;
  }[];
};

function mapProgram(row: Record<string, unknown>): PartnerAffiliateProgram {
  return {
    id: String(row.id),
    slug: String(row.slug ?? ""),
    businessName: formatBusinessName(String(row.business_name ?? "")),
    affiliateEnabled: Boolean(row.affiliate_enabled),
    commissionPercent: (row.affiliate_commission_percent as number | null) ?? null,
    cookieDurationDays: (row.affiliate_cookie_duration_days as number | null) ?? null,
  };
}

export function resolvePartnerAffiliateInsight(
  overview: PartnerAffiliateOverview
): PartnerAffiliateInsight | null {
  if (overview.totalAffiliates === 0) {
    return "no_affiliates";
  }
  if (overview.totalClicks === 0) {
    return "no_clicks";
  }
  if (overview.totalClicks >= 10 && overview.affiliateOrders === 0) {
    return "high_clicks_no_sales";
  }
  if (overview.clicksThisWeek >= 10) {
    return "growing";
  }
  return null;
}

export async function getPartnerAffiliateProgram(
  partnerId: string
): Promise<PartnerAffiliateProgram | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: partnerId,
      slug: "demo-brand",
      businessName: "Demo Brand",
      affiliateEnabled: true,
      commissionPercent: 10,
      cookieDurationDays: 30,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_affiliate_program", {
    p_partner_id: partnerId,
  });

  if (error || !data) {
    return null;
  }

  return mapProgram(data as Record<string, unknown>);
}

export async function getPartnerAffiliateOverview(
  partnerId: string
): Promise<PartnerAffiliateOverview | null> {
  if (!isSupabaseConfigured()) {
    return {
      enabled: true,
      totalAffiliates: 0,
      referralLinks: 0,
      totalClicks: 0,
      clicksThisMonth: 0,
      clicksThisWeek: 0,
      clicksToday: 0,
      estimatedSales: 0,
      estimatedCommission: 0,
      affiliateOrders: 0,
      conversionRate: 0,
      averageOrderValue: 0,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_affiliate_overview", {
    p_partner_id: partnerId,
  });

  if (error || !data) {
    return null;
  }

  const row = data as Record<string, unknown>;
  if (!row.enabled) {
    return {
      enabled: false,
      totalAffiliates: 0,
      referralLinks: 0,
      totalClicks: 0,
      clicksThisMonth: 0,
      clicksThisWeek: 0,
      clicksToday: 0,
      estimatedSales: 0,
      estimatedCommission: 0,
      affiliateOrders: 0,
      conversionRate: 0,
      averageOrderValue: 0,
    };
  }

  return {
    enabled: true,
    totalAffiliates: Number(row.total_affiliates ?? 0),
    referralLinks: Number(row.referral_links ?? 0),
    totalClicks: Number(row.total_clicks ?? 0),
    clicksThisMonth: Number(row.clicks_this_month ?? 0),
    clicksThisWeek: Number(row.clicks_this_week ?? 0),
    clicksToday: Number(row.clicks_today ?? 0),
    estimatedSales: Number(row.estimated_sales ?? 0),
    estimatedCommission: Number(row.estimated_commission ?? 0),
    affiliateOrders: Number(row.affiliate_orders ?? 0),
    conversionRate: Number(row.conversion_rate ?? 0),
    averageOrderValue: Number(row.average_order_value ?? 0),
  };
}

function mapDirectoryRow(row: Record<string, unknown>): PartnerAffiliateDirectoryRow {
  const firstName = String(row.first_name ?? "");
  const lastName = String(row.last_name ?? "");
  const linkPath = String(row.link_path ?? "");

  return {
    affiliateId: String(row.affiliate_id),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    country: String(row.country ?? ""),
    status: String(row.status ?? "ACTIVE"),
    joinedAt: String(row.joined_at ?? ""),
    linkPath,
    referralUrl: buildReferralUrl(linkPath),
    totalClicks: Number(row.total_clicks ?? 0),
    estimatedSales: Number(row.estimated_sales ?? 0),
    estimatedCommission: Number(row.estimated_commission ?? 0),
  };
}

export async function getPartnerAffiliateDirectory(
  partnerId: string,
  options: { search?: string; sort?: string; country?: string } = {}
): Promise<PartnerAffiliateDirectoryRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_affiliate_directory", {
    p_partner_id: partnerId,
    p_search: options.search ?? null,
    p_sort: options.sort ?? "newest",
    p_country: options.country ?? null,
  });

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map(mapDirectoryRow);
}

export async function getPartnerAffiliateDetail(
  partnerId: string,
  affiliateId: string
): Promise<PartnerAffiliateDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_affiliate_detail", {
    p_partner_id: partnerId,
    p_affiliate_id: affiliateId,
  });

  if (error || !data) {
    return null;
  }

  const row = data as Record<string, unknown>;
  const firstName = String(row.first_name ?? "");
  const lastName = String(row.last_name ?? "");
  const linkPath = String(row.link_path ?? "");
  const activity = Array.isArray(row.recent_activity) ? row.recent_activity : [];

  return {
    affiliateId: String(row.affiliate_id),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    country: String(row.country ?? ""),
    status: String(row.status ?? "ACTIVE"),
    joinedAt: String(row.joined_at ?? ""),
    linkPath,
    referralUrl: buildReferralUrl(linkPath),
    totalClicks: Number(row.total_clicks ?? 0),
    recentActivity: activity.map((item) => {
      const event = item as Record<string, unknown>;
      return {
        clickedAt: String(event.clicked_at ?? ""),
        device: (event.device as string | null) ?? null,
        referrer: (event.referrer as string | null) ?? null,
      };
    }),
  };
}

export async function getPartnerAffiliateAnalytics(
  partnerId: string
): Promise<PartnerAffiliateAnalytics | null> {
  if (!isSupabaseConfigured()) {
    return {
      clicksToday: 0,
      clicks7Days: 0,
      clicks30Days: 0,
      clicksAllTime: 0,
      dailyClicks: [],
      monthlyClicks: [],
      topReferrers: [],
      topDevices: [],
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_affiliate_analytics", {
    p_partner_id: partnerId,
  });

  if (error || !data) {
    return null;
  }

  const row = data as Record<string, unknown>;

  return {
    clicksToday: Number(row.clicks_today ?? 0),
    clicks7Days: Number(row.clicks_7_days ?? 0),
    clicks30Days: Number(row.clicks_30_days ?? 0),
    clicksAllTime: Number(row.clicks_all_time ?? 0),
    dailyClicks: ((row.daily_clicks as Record<string, unknown>[]) ?? []).map((item) => ({
      day: String(item.day ?? ""),
      clicks: Number(item.clicks ?? 0),
    })),
    monthlyClicks: ((row.monthly_clicks as Record<string, unknown>[]) ?? []).map((item) => ({
      month: String(item.month ?? ""),
      clicks: Number(item.clicks ?? 0),
    })),
    topReferrers: ((row.top_referrers as Record<string, unknown>[]) ?? []).map((item) => ({
      source: String(item.source ?? "Direct"),
      clicks: Number(item.clicks ?? 0),
    })),
    topDevices: ((row.top_devices as Record<string, unknown>[]) ?? []).map((item) => ({
      device: String(item.device ?? "Unknown"),
      clicks: Number(item.clicks ?? 0),
    })),
  };
}

export async function getPartnerReferralLinks(
  partnerId: string,
  search?: string
): Promise<PartnerReferralLinkRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_referral_links", {
    p_partner_id: partnerId,
    p_search: search ?? null,
  });

  if (error || !data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => {
    const linkPath = String(row.link_path ?? "");
    return {
      linkId: String(row.link_id),
      linkPath,
      referralUrl: buildReferralUrl(linkPath),
      createdAt: String(row.created_at ?? ""),
      clicks: Number(row.clicks ?? 0),
      affiliateId: String(row.affiliate_id),
      affiliateName: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
    };
  });
}

export async function getAdminAffiliateAnalytics(): Promise<AdminAffiliateAnalytics> {
  const empty: AdminAffiliateAnalytics = {
    participatingBrands: 0,
    totalAffiliates: 0,
    referralLinks: 0,
    totalClicks: 0,
    topBrands: [],
    topAffiliates: [],
    newestAffiliates: [],
    newestPrograms: [],
  };

  if (!isSupabaseConfigured()) {
    return empty;
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_affiliate_analytics");
  if (error || !data) {
    return empty;
  }

  const row = data as Record<string, unknown>;

  return {
    participatingBrands: Number(row.participating_brands ?? 0),
    totalAffiliates: Number(row.total_affiliates ?? 0),
    referralLinks: Number(row.referral_links ?? 0),
    totalClicks: Number(row.total_clicks ?? 0),
    topBrands: ((row.top_brands as Record<string, unknown>[]) ?? []).map((item) => ({
      id: String(item.id),
      businessName: formatBusinessName(String(item.business_name ?? "")),
      slug: (item.slug as string | null) ?? null,
      clicks: Number(item.clicks ?? 0),
    })),
    topAffiliates: ((row.top_affiliates as Record<string, unknown>[]) ?? []).map((item) => ({
      id: String(item.id),
      firstName: String(item.first_name ?? ""),
      lastName: String(item.last_name ?? ""),
      country: String(item.country ?? ""),
      clicks: Number(item.clicks ?? 0),
    })),
    newestAffiliates: ((row.newest_affiliates as Record<string, unknown>[]) ?? []).map(
      (item) => ({
        id: String(item.id),
        firstName: String(item.first_name ?? ""),
        lastName: String(item.last_name ?? ""),
        email: String(item.email ?? ""),
        country: String(item.country ?? ""),
        createdAt: String(item.created_at ?? ""),
      })
    ),
    newestPrograms: ((row.newest_programs as Record<string, unknown>[]) ?? []).map((item) => ({
      id: String(item.id),
      businessName: formatBusinessName(String(item.business_name ?? "")),
      slug: (item.slug as string | null) ?? null,
      commissionPercent: (item.affiliate_commission_percent as number | null) ?? null,
      createdAt: (item.affiliate_created_at as string | null) ?? null,
    })),
  };
}
