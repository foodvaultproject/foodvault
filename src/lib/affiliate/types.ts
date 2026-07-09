export type AffiliateRecord = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  paymentCountry: string;
  bankAccountName: string;
  bankAccountNumber: string;
  taxNumber: string | null;
  referralCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AffiliateReferralLink = {
  id: string;
  affiliateId: string;
  partnerId: string;
  linkPath: string;
  url: string;
};

export type AffiliateParticipatingBrand = {
  id: string;
  slug: string;
  businessName: string;
  shortDescription: string | null;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: import("@/lib/partner-logo-crop").LogoCropSettings | null;
  commissionPercent: number | null;
  cookieDurationDays: number | null;
  programDescription: string | null;
  affiliateTerms: string | null;
  websiteUrl: string | null;
  referralLink: AffiliateReferralLink | null;
};

export type AffiliateClickEvent = {
  id: string;
  partnerId: string;
  brandName: string;
  clickedAt: string;
  device: string | null;
  referrer: string | null;
};

export type AffiliateDashboardStats = {
  participatingBrands: number;
  referralLinks: number;
  totalClicks: number;
  clicksToday: number;
  clicksLast7Days: number;
  clicksLast30Days: number;
  totalSales: number;
  totalOrders: number;
  pendingEarnings: number;
  approvedEarnings: number;
  paidEarnings: number;
  recentClicks: AffiliateClickEvent[];
};

export type AffiliateRegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
};

export type AffiliateSettingsInput = {
  firstName: string;
  lastName: string;
  country: string;
  paymentCountry: string;
};

export type AdminAffiliateStats = {
  totalAffiliates: number;
  participatingBrands: number;
  referralLinksGenerated: number;
  totalClicks: number;
};

export type AdminAffiliateRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  country: string;
  status: string;
  createdAt: string;
};

export type AdminAffiliateBrandRow = {
  id: string;
  businessName: string | null;
  slug: string | null;
  affiliateCommissionPercent: number | null;
  affiliateEnabled: boolean;
};
