import { isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  formatBusinessName,
  formatBusinessNameOrNull,
} from "@/lib/business-name";
import type {
  ContactEnquiryRow,
  DashboardStats,
  DiscoverArticleRow,
  AdminAffiliateBrandRow,
  AdminAffiliateRow,
  AdminAffiliateStats,
  BrandReportEventRow,
  BrandReportListResult,
  BrandReportRow,
  BrandReportStats,
  AdminUserOption,
  MemberRow,
  PartnerApplicationRow,
  PartnerRow,
  SystemSettings,
} from "@/lib/admin/types";
import type { AdminAffiliateAnalytics } from "@/lib/partner-affiliate/analytics";
import type {
  AdminAffiliateTransactionRow,
  AdminAffiliateTransactionSummary,
} from "@/lib/store-integration/types";
import { getSystemSettingsForAdmin } from "@/lib/member/settings";
import {
  mockApplications,
  mockArticles,
  mockBrandReports,
  mockDashboardStats,
  mockEnquiries,
  mockMembers,
  mockPartners,
  mockRecentEnquiries,
  mockRecentMembers,
  mockSettings,
} from "@/lib/admin/mock-data";

function formatPartnerApplicationRow(row: PartnerApplicationRow): PartnerApplicationRow {
  return {
    ...row,
    business_name: formatBusinessNameOrNull(row.business_name),
  };
}

function formatPartnerRow(row: PartnerRow): PartnerRow {
  return {
    ...row,
    business_name: formatBusinessNameOrNull(row.business_name),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) return mockDashboardStats;

  const supabase = await createClient();
  const [
    membersRes,
    paidRes,
    livePartnersRes,
    pendingRes,
    enquiriesRes,
    articlesRes,
  ] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("subscription_status", "ACTIVE"),
    supabase
      .from("partners")
      .select("id", { count: "exact", head: true })
      .eq("listing_status_v2", "LIVE")
      .eq("suspended", false),
    supabase
      .from("partners")
      .select("id", { count: "exact", head: true })
      .eq("application_status_v2", "APPLICATION_UNDER_REVIEW"),
    supabase
      .from("contact_enquiries")
      .select("id", { count: "exact", head: true })
      .in("status", ["NEW", "OPEN"]),
    supabase
      .from("discover_articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED"),
  ]);

  return {
    activeMembers: membersRes.count ?? 0,
    paidMembers: paidRes.count ?? 0,
    livePartners: livePartnersRes.count ?? 0,
    pendingApplications: pendingRes.count ?? 0,
    supportEnquiries: enquiriesRes.count ?? 0,
    publishedArticles: articlesRes.count ?? 0,
  };
}

export async function getPendingApplications(): Promise<PartnerApplicationRow[]> {
  if (!isSupabaseConfigured()) return mockApplications.map(formatPartnerApplicationRow);

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_list_pending_applications");

  return ((data ?? []) as PartnerApplicationRow[]).map(formatPartnerApplicationRow);
}

export async function getAllPartners(search?: string): Promise<PartnerRow[]> {
  if (!isSupabaseConfigured()) {
    const q = search?.toLowerCase() ?? "";
    return mockPartners.filter(
      (p) =>
        !q ||
        p.business_name?.toLowerCase().includes(q) ||
        p.member_code?.toLowerCase().includes(q)
    ).map(formatPartnerRow);
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_list_partners", {
    p_search: search ?? null,
  });

  return ((data ?? []) as PartnerRow[]).map(formatPartnerRow);
}

export async function getMembers(search?: string): Promise<MemberRow[]> {
  if (!isSupabaseConfigured()) {
    const q = search?.toLowerCase() ?? "";
    return mockMembers.filter(
      (m) =>
        !q ||
        m.email.toLowerCase().includes(q) ||
        m.full_name?.toLowerCase().includes(q)
    );
  }

  const supabase = await createClient();
  let query = supabase
    .from("members")
    .select("id, email, full_name, status, joined_at")
    .order("joined_at", { ascending: false });

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data } = await query.limit(50);
  return (data ?? []) as MemberRow[];
}

export async function getMemberStats() {
  if (!isSupabaseConfigured()) {
    return {
      totalMembers: 12482,
      activeTrial: 843,
      newThisMonth: 1120,
      churnRate: 2.4,
    };
  }

  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [total, trial, newMonth] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "TRIAL"),
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .gte("joined_at", monthStart),
  ]);

  return {
    totalMembers: total.count ?? 0,
    activeTrial: trial.count ?? 0,
    newThisMonth: newMonth.count ?? 0,
    churnRate: 2.4,
  };
}

export async function getArticles(
  filter: "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED" = "ALL"
): Promise<DiscoverArticleRow[]> {
  if (!isSupabaseConfigured()) {
    if (filter === "ALL") return mockArticles;
    return mockArticles.filter((a) => a.status === filter);
  }

  const supabase = await createClient();
  let query = supabase
    .from("discover_articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter !== "ALL") {
    query = query.eq("status", filter);
  }

  const { data } = await query;
  return (data ?? []) as DiscoverArticleRow[];
}

export async function getArticleById(id: string): Promise<DiscoverArticleRow | null> {
  if (!isSupabaseConfigured()) {
    return mockArticles.find((a) => a.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("discover_articles").select("*").eq("id", id).maybeSingle();
  return (data as DiscoverArticleRow | null) ?? null;
}

export async function getEnquiries(search?: string): Promise<ContactEnquiryRow[]> {
  if (!isSupabaseConfigured()) {
    const q = search?.toLowerCase() ?? "";
    return mockEnquiries.filter(
      (e) =>
        !q ||
        e.reference_number.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
    );
  }

  const supabase = await createClient();
  let query = supabase
    .from("contact_enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `reference_number.ilike.%${search}%,name.ilike.%${search}%,subject.ilike.%${search}%`
    );
  }

  const { data } = await query;
  return (data ?? []) as ContactEnquiryRow[];
}

export async function getEnquiryById(id: string): Promise<ContactEnquiryRow | null> {
  if (!isSupabaseConfigured()) return mockEnquiries.find((e) => e.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("contact_enquiries").select("*").eq("id", id).maybeSingle();
  return (data as ContactEnquiryRow | null) ?? null;
}

export async function getRecentMembers() {
  if (!isSupabaseConfigured()) return mockRecentMembers;
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("id, email, full_name, status, joined_at")
    .order("joined_at", { ascending: false })
    .limit(5);
  return (data ?? []) as MemberRow[];
}

export async function getRecentEnquiries() {
  if (!isSupabaseConfigured()) return mockRecentEnquiries;
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_enquiries")
    .select("id, reference_number, name, enquiry_type, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

export async function getSystemSettings(): Promise<SystemSettings> {
  if (!isSupabaseConfigured()) return mockSettings;
  return getSystemSettingsForAdmin();
}

export async function getLivePartnersForHomepage() {
  if (!isSupabaseConfigured()) {
    return mockPartners.filter((p) => p.listing_status_v2 === "LIVE" && !p.suspended);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("id, business_name, primary_category")
    .eq("listing_status_v2", "LIVE")
    .eq("suspended", false)
    .order("business_name");
  return (data ?? []).map(formatHomepagePartnerRow);
}

function formatHomepagePartnerRow<T extends { business_name?: string | null }>(
  row: T
): T {
  return {
    ...row,
    business_name: formatBusinessNameOrNull(row.business_name),
  };
}

export async function getHomepageFeatured(section: "FEATURED_PARTNERS" | "NEW_THIS_WEEK") {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("homepage_featured")
    .select("id, partner_id, sort_order, partners(id, business_name)")
    .eq("section", section)
    .order("sort_order");

  return (data ?? []).map((row) => {
    const partner = Array.isArray(row.partners) ? row.partners[0] : row.partners;
    if (!partner || typeof partner !== "object") {
      return row;
    }

    return {
      ...row,
      partners: formatHomepagePartnerRow(partner as { business_name?: string | null }),
    };
  });
}

export async function getContactStats() {
  if (!isSupabaseConfigured()) {
    return { active: 124, avgResponse: "2h 14m", resolvedToday: 42, priority: 7 };
  }
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [active, resolved] = await Promise.all([
    supabase
      .from("contact_enquiries")
      .select("id", { count: "exact", head: true })
      .in("status", ["NEW", "OPEN"]),
    supabase
      .from("contact_enquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "RESOLVED")
      .gte("updated_at", today.toISOString()),
  ]);
  return {
    active: active.count ?? 0,
    avgResponse: "2h 14m",
    resolvedToday: resolved.count ?? 0,
    priority: 7,
  };
}

export async function getDiscoverStats() {
  if (!isSupabaseConfigured()) {
    return { total: 1284, published: 1102, drafts: 142, views: 45200 };
  }
  const supabase = await createClient();
  const [total, published, drafts, viewsRes] = await Promise.all([
    supabase.from("discover_articles").select("id", { count: "exact", head: true }),
    supabase.from("discover_articles").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
    supabase.from("discover_articles").select("id", { count: "exact", head: true }).eq("status", "DRAFT"),
    supabase.from("discover_articles").select("views"),
  ]);
  const views = (viewsRes.data ?? []).reduce((sum, row) => sum + (row.views ?? 0), 0);
  return {
    total: total.count ?? 0,
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
    views,
  };
}

export async function getApplicationStats() {
  if (!isSupabaseConfigured()) {
    return { pending: 42, approvedToday: 18, avgReview: "4.2h", rejectionRate: "5.4%" };
  }
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [pending, approvedToday] = await Promise.all([
    supabase
      .from("partners")
      .select("id", { count: "exact", head: true })
      .eq("application_status_v2", "APPLICATION_UNDER_REVIEW"),
    supabase
      .from("partners")
      .select("id", { count: "exact", head: true })
      .eq("application_status_v2", "APPROVED")
      .gte("approved_at", today.toISOString()),
  ]);
  return {
    pending: pending.count ?? 0,
    approvedToday: approvedToday.count ?? 0,
    avgReview: "4.2h",
    rejectionRate: "5.4%",
  };
}

export async function getPartnerStats() {
  if (!isSupabaseConfigured()) {
    return { total: 1284, pendingActivation: 42, avgApproval: "2.4d" };
  }
  const supabase = await createClient();
  const [total, pending] = await Promise.all([
    supabase.from("partners").select("id", { count: "exact", head: true }),
    supabase
      .from("partners")
      .select("id", { count: "exact", head: true })
      .eq("application_status_v2", "APPROVED")
      .neq("listing_status_v2", "LIVE"),
  ]);
  return { total: total.count ?? 0, pendingActivation: pending.count ?? 0, avgApproval: "2.4d" };
}

export async function getRecentAuditLogs(limit = 5) {
  if (!isSupabaseConfigured()) {
    return [
      { action: "Sarah M. approved Nordic Fish Co.", created_at: new Date().toISOString() },
      { action: "System updated payout terms for EU region.", created_at: new Date().toISOString() },
    ];
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("action, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
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

  const supabase = await createClient();
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

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_affiliates", {
    p_search: search ?? null,
  });

  if (error || !data) {
    return [];
  }

  return data as AdminAffiliateRow[];
}

export async function getAdminAffiliateBrands(
  search?: string
): Promise<AdminAffiliateBrandRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_search_affiliate_brands", {
    p_search: search ?? null,
  });

  if (error || !data) {
    return [];
  }

  return data as AdminAffiliateBrandRow[];
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

  const supabase = await createClient();
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

  const supabase = await createClient();
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
      status: String(item.status ?? "pending") as AdminAffiliateTransactionRow["status"],
      reviewRequired: Boolean(item.review_required),
      businessName: formatBusinessName(String(item.business_name ?? "")),
      brandSlug: (item.slug as string | null) ?? null,
      affiliateName: `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim(),
      affiliateEmail: String(item.email ?? ""),
      platform: (item.platform as AdminAffiliateTransactionRow["platform"]) ?? null,
    })),
  };
}

export async function getPlatformHealthDashboard() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_platform_health_dashboard");

  if (error || !data) return null;
  return data;
}

export async function getAdminFraudFlagsForReview(status?: string) {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
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

type BrandReportFilters = {
  search?: string;
  status?: string;
  priority?: string;
  brandId?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "oldest" | "priority";
};

function mapBrandReportRow(row: Record<string, unknown>): BrandReportRow {
  const partner = row.partners as Record<string, unknown> | null;
  const assignee = row.admin_users as Record<string, unknown> | null;

  return {
    id: String(row.id),
    report_reference: String(row.report_reference),
    brand_id: String(row.brand_id),
    brand_name: (partner?.business_name as string | null) ?? null,
    brand_logo_url: (partner?.logo_url as string | null) ?? null,
    reporter_user_id: String(row.reporter_user_id),
    reporter_email: (row.reporter_email as string | null) ?? null,
    reason: String(row.reason),
    description: String(row.description),
    contact_permission: Boolean(row.contact_permission),
    attachment_urls: Array.isArray(row.attachment_urls)
      ? (row.attachment_urls as string[])
      : [],
    status: String(row.status),
    priority: String(row.priority),
    admin_notes: (row.admin_notes as string | null) ?? null,
    assigned_admin_id: (row.assigned_admin_id as string | null) ?? null,
    assigned_admin_name: (assignee?.full_name as string | null) ?? null,
    reviewed_at: (row.reviewed_at as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getBrandReportStats(): Promise<BrandReportStats> {
  if (!isSupabaseConfigured()) {
    return {
      newCount: mockBrandReports.filter((row) => row.status === "New").length,
      underReviewCount: mockBrandReports.filter((row) => row.status === "Under Review")
        .length,
      resolvedCount: mockBrandReports.filter((row) => row.status === "Resolved").length,
      criticalCount: mockBrandReports.filter((row) => row.priority === "Critical").length,
    };
  }

  const supabase = await createClient();
  const [newRes, reviewRes, resolvedRes, criticalRes] = await Promise.all([
    supabase.from("brand_reports").select("id", { count: "exact", head: true }).eq("status", "New"),
    supabase
      .from("brand_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "Under Review"),
    supabase
      .from("brand_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "Resolved"),
    supabase
      .from("brand_reports")
      .select("id", { count: "exact", head: true })
      .eq("priority", "Critical"),
  ]);

  return {
    newCount: newRes.count ?? 0,
    underReviewCount: reviewRes.count ?? 0,
    resolvedCount: resolvedRes.count ?? 0,
    criticalCount: criticalRes.count ?? 0,
  };
}

export async function getBrandReports(
  filters: BrandReportFilters = {}
): Promise<BrandReportListResult> {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);

  if (!isSupabaseConfigured()) {
    let rows = [...mockBrandReports];
    const q = filters.search?.toLowerCase() ?? "";
    if (q) {
      rows = rows.filter(
        (row) =>
          row.report_reference.toLowerCase().includes(q) ||
          (row.brand_name ?? "").toLowerCase().includes(q) ||
          (row.reporter_email ?? "").toLowerCase().includes(q) ||
          row.reason.toLowerCase().includes(q)
      );
    }
    if (filters.status) rows = rows.filter((row) => row.status === filters.status);
    if (filters.priority) rows = rows.filter((row) => row.priority === filters.priority);
    if (filters.brandId) rows = rows.filter((row) => row.brand_id === filters.brandId);

    if (filters.sort === "oldest") {
      rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else if (filters.sort === "priority") {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      rows.sort(
        (a, b) =>
          (order[a.priority as keyof typeof order] ?? 9) -
          (order[b.priority as keyof typeof order] ?? 9)
      );
    } else {
      rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    return { rows: rows.slice(start, start + pageSize), total };
  }

  const supabase = await createClient();
  let query = supabase.from("brand_reports").select(
    `
      *,
      partners ( business_name, logo_url ),
      admin_users ( full_name )
    `,
    { count: "exact" }
  );

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.brandId) query = query.eq("brand_id", filters.brandId);
  if (filters.search) {
    const q = filters.search.trim();
    query = query.or(
      `report_reference.ilike.%${q}%,reason.ilike.%${q}%,description.ilike.%${q}%,reporter_email.ilike.%${q}%`
    );
  }

  if (filters.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (filters.sort === "priority") {
    query = query.order("priority", { ascending: true }).order("created_at", {
      ascending: false,
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    return { rows: [], total: 0 };
  }

  return {
    rows: (data ?? []).map((row) => mapBrandReportRow(row as Record<string, unknown>)),
    total: count ?? 0,
  };
}

export async function getBrandReportEvents(reportId: string): Promise<BrandReportEventRow[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "evt-1",
        report_id: reportId,
        event_type: "submitted",
        description: "Report submitted",
        metadata: {},
        admin_user_id: null,
        admin_name: null,
        created_at: "2024-10-24T10:00:00Z",
      },
    ];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_report_events")
    .select("*, admin_users(full_name)")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => {
    const record = row as Record<string, unknown>;
    const admin = record.admin_users as Record<string, unknown> | null;
    return {
      id: String(record.id),
      report_id: String(record.report_id),
      event_type: String(record.event_type),
      description: String(record.description),
      metadata: (record.metadata as Record<string, unknown>) ?? {},
      admin_user_id: (record.admin_user_id as string | null) ?? null,
      admin_name: (admin?.full_name as string | null) ?? null,
      created_at: String(record.created_at),
    };
  });
}

export async function getAdminUserOptions(): Promise<AdminUserOption[]> {
  if (!isSupabaseConfigured()) {
    return [{ id: "admin-1", full_name: "Admin User", email: "admin@foodvault.co.nz" }];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("id, full_name, email")
    .order("full_name", { ascending: true });

  return (data ?? []) as AdminUserOption[];
}
