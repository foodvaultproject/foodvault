export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_DASHBOARD_PATH = "/admin/dashboard";

export const DISCOVER_CMS_CATEGORIES = [
  "Saving",
  "Brands",
  "Recipes",
  "News",
] as const;

export type DiscoverCategory = (typeof DISCOVER_CMS_CATEGORIES)[number];

export type AdminUser = {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  role: string;
};

export type PartnerApplicationRow = {
  id: string;
  business_name: string | null;
  website_url: string | null;
  primary_category: string | null;
  location: string | null;
  created_at: string;
  short_description: string | null;
  brand_story: string | null;
  discount_value: string | null;
  offer_type: string | null;
  offer_scope?: string | null;
  selected_products?: unknown;
  offer_terms: string | null;
  member_code: string | null;
  support_email: string | null;
  support_phone: string | null;
  banner_image_url: string | null;
  logo_url: string | null;
  gallery_image_urls: string[] | null;
};

export type PartnerRow = {
  id: string;
  business_name: string | null;
  primary_category: string | null;
  application_status_v2: string;
  listing_status_v2: string;
  suspended: boolean;
  approved_at: string | null;
  location: string | null;
  member_code: string | null;
};

export type MemberRow = {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  joined_at: string;
};

export type ContactEnquiryRow = {
  id: string;
  reference_number: string;
  name: string;
  email: string;
  enquiry_type: string;
  subject: string;
  message: string;
  status: string;
  internal_notes: string | null;
  created_at: string;
};

export type AdminAffiliateRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  referral_code: string;
  country: string;
  status: string;
  created_at: string;
};

export type AdminAffiliateBrandRow = {
  id: string;
  business_name: string | null;
  slug: string | null;
  affiliate_commission_percent: number | null;
  affiliate_enabled: boolean;
};

export type AdminAffiliateStats = {
  totalAffiliates: number;
  participatingBrands: number;
  referralLinksGenerated: number;
  totalClicks: number;
};

export type DiscoverArticleRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  summary: string | null;
  body: string | null;
  hero_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_tags: string[] | null;
  featured: boolean;
  publish_date: string | null;
  author_name: string | null;
  read_time_minutes: number | null;
  views: number;
  created_at: string;
  updated_at?: string | null;
};

export type SystemSettings = {
  platform_name: string;
  membership_price_monthly: number;
  trial_length_days: number;
  support_email: string;
  homepage_headline: string | null;
  homepage_subheading: string | null;
};

export type DashboardStats = {
  activeMembers: number;
  paidMembers: number;
  livePartners: number;
  pendingApplications: number;
  supportEnquiries: number;
  publishedArticles: number;
};

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getPartnerStatusBadge(partner: PartnerRow) {
  if (partner.suspended) return "Suspended" as const;
  if (partner.listing_status_v2 === "LIVE") return "Live" as const;
  if (partner.application_status_v2 === "APPLICATION_UNDER_REVIEW") return "Under Review" as const;
  if (partner.application_status_v2 === "APPROVED") return "Pending Activation" as const;
  return "Under Review" as const;
}

export type BrandReportRow = {
  id: string;
  report_reference: string;
  brand_id: string;
  brand_name: string | null;
  brand_logo_url: string | null;
  reporter_user_id: string;
  reporter_email: string | null;
  reason: string;
  description: string;
  contact_permission: boolean;
  attachment_urls: string[];
  status: string;
  priority: string;
  admin_notes: string | null;
  assigned_admin_id: string | null;
  assigned_admin_name: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BrandReportEventRow = {
  id: string;
  report_id: string;
  event_type: string;
  description: string;
  metadata: Record<string, unknown>;
  admin_user_id: string | null;
  admin_name: string | null;
  created_at: string;
};

export type BrandReportStats = {
  newCount: number;
  underReviewCount: number;
  resolvedCount: number;
  criticalCount: number;
};

export type BrandReportListResult = {
  rows: BrandReportRow[];
  total: number;
};

export type AdminUserOption = {
  id: string;
  full_name: string;
  email: string;
};
