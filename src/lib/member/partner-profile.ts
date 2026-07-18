import { isSupabaseConfigured } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin/auth";
import { getActiveMemberView } from "@/lib/member/active-member";
import { getFreeTrialMemberView } from "@/lib/member/free-trial-member";
import { formatBusinessName } from "@/lib/business-name";
import { featuredBrands } from "@/data/homepage";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import { memberHasActiveAccess } from "@/lib/member/member-record";
import {
  formatPartnerDiscountLabel,
  partnerProfileSlug,
} from "@/lib/member/favorites-utils";
import {
  resolvePartnerOnboardingState,
  type PartnerOnboardingState,
} from "@/lib/partner-status";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseLogoCrop, type LogoCropSettings } from "@/lib/partner-logo-crop";
import {
  getDepartmentsFromGroups,
  resolveCategoryGroupsFromRecord,
  type PartnerCategoryGroup,
} from "@/data/partner-categories";
import {
  offerScopeFromLegacyAppliesTo,
  parseOfferScope,
  parseSelectedProducts,
  type OfferScope,
  type SelectedProduct,
} from "@/lib/partner-offer";

export type PartnerProfile = {
  id: string;
  slug: string;
  businessName: string;
  shortDescription: string | null;
  brandStory: string | null;
  websiteUrl: string | null;
  country: string | null;
  department: string | null;
  departments: string[];
  subcategories: string[];
  categoryGroups: PartnerCategoryGroup[];
  offerType: string | null;
  discountValue: string | null;
  discountPercent: number | null;
  discountLabel: string;
  offerScope: OfferScope;
  selectedProducts: SelectedProduct[];
  /** @deprecated Legacy free-text scope label */
  offerAppliesTo: string | null;
  bannerImageUrl: string | null;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: LogoCropSettings | null;
  galleryImageUrls: string[];
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  youtube: string | null;
  isFeatured: boolean;
  affiliateEnabled: boolean;
  affiliateCommissionPercent: number | null;
  affiliateCookieDurationDays: number | null;
  affiliateProgramDescription: string | null;
  affiliateTerms: string | null;
};

export type CodeAccessState =
  | "visible"
  | "anon"
  | "partner-other"
  | "member-required";

export type ProfileViewerContext = {
  isLoggedIn: boolean;
  isPartner: boolean;
  isActiveMember: boolean;
  isFreeTrialMember: boolean;
  isAdmin: boolean;
  canFavorite: boolean;
  isFavorited: boolean;
  isOwnProfile: boolean;
  ownOnboardingState: PartnerOnboardingState | null;
};

type ProfileViewRow = {
  id: string;
  slug: string;
  business_name: string;
  short_description: string | null;
  brand_story: string | null;
  website_url: string | null;
  location: string | null;
  department: string | null;
  primary_categories: string[] | null;
  category_groups: unknown;
  subcategories: string[] | null;
  offer_type: string | null;
  discount_value: string | null;
  discount_percent: number | null;
  offer_applies_to: string | null;
  offer_scope: string | null;
  selected_products: unknown;
  banner_image_url: string | null;
  logo_url: string | null;
  logo_original_url: string | null;
  logo_crop: unknown;
  gallery_image_urls: string[] | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  youtube: string | null;
  is_featured: boolean;
  affiliate_enabled: boolean | null;
  affiliate_commission_percent: number | null;
  affiliate_cookie_duration_days: number | null;
  affiliate_program_description: string | null;
  affiliate_terms: string | null;
};

const PARTNER_PREVIEW_COLUMNS_BASE =
  "id, slug, business_name, short_description, brand_story, website_url, location, primary_category, primary_categories, category_groups, subcategories, offer_type, discount_value, discount_percent, offer_applies_to, offer_terms, banner_image_url, logo_url, gallery_image_urls, instagram, facebook, linkedin, tiktok, youtube, featured_until";

const PARTNER_PREVIEW_COLUMNS = `${PARTNER_PREVIEW_COLUMNS_BASE}, logo_original_url, logo_crop, offer_scope, selected_products, affiliate_enabled, affiliate_commission_percent, affiliate_cookie_duration_days, affiliate_program_description, affiliate_terms`;

async function fetchOwnPartnerPreviewRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Record<string, unknown> | null> {
  const full = await supabase
    .from("partners")
    .select(PARTNER_PREVIEW_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (!full.error && full.data) {
    return full.data as Record<string, unknown>;
  }

  const fallback = await supabase
    .from("partners")
    .select(PARTNER_PREVIEW_COLUMNS_BASE)
    .eq("user_id", userId)
    .maybeSingle();

  if (fallback.error || !fallback.data) {
    return null;
  }

  return fallback.data as Record<string, unknown>;
}

function mapPartnerTableRow(row: Record<string, unknown>): PartnerProfile {
  return mapProfileRow({
    id: row.id,
    slug: row.slug,
    business_name: row.business_name,
    short_description: row.short_description,
    brand_story: row.brand_story,
    website_url: row.website_url,
    location: row.location,
    department: row.primary_category,
    primary_categories: row.primary_categories,
    category_groups: row.category_groups,
    subcategories: row.subcategories,
    offer_type: row.offer_type,
    discount_value: row.discount_value,
    discount_percent: row.discount_percent,
    offer_applies_to: row.offer_applies_to,
    offer_scope: row.offer_scope,
    selected_products: row.selected_products,
    banner_image_url: row.banner_image_url,
    logo_url: row.logo_url,
    logo_original_url: row.logo_original_url,
    logo_crop: row.logo_crop,
    gallery_image_urls: row.gallery_image_urls,
    instagram: row.instagram,
    facebook: row.facebook,
    linkedin: row.linkedin,
    tiktok: row.tiktok,
    youtube: row.youtube,
    is_featured:
      row.featured_until != null &&
      new Date(String(row.featured_until)).getTime() > Date.now(),
    affiliate_enabled: row.affiliate_enabled,
    affiliate_commission_percent: row.affiliate_commission_percent,
    affiliate_cookie_duration_days: row.affiliate_cookie_duration_days,
    affiliate_program_description: row.affiliate_program_description,
    affiliate_terms: row.affiliate_terms,
  } as ProfileViewRow);
}

async function getPartnerOwnProfilePreview(
  _slug: string
): Promise<PartnerProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const row = await fetchOwnPartnerPreviewRow(supabase, user.id);
  if (!row) {
    return null;
  }

  // Partners can preview their submitted listing before it is publicly visible.
  return mapPartnerTableRow(row);
}

function mapProfileRow(row: ProfileViewRow): PartnerProfile {
  const businessName = formatBusinessName(row.business_name);
  const categoryGroups = resolveCategoryGroupsFromRecord(row);
  const departments =
    Array.isArray(row.primary_categories) && row.primary_categories.length > 0
      ? row.primary_categories.filter(
          (value): value is string => typeof value === "string" && value.length > 0
        )
      : getDepartmentsFromGroups(categoryGroups);

  return {
    id: row.id,
    slug: row.slug || partnerProfileSlug(businessName),
    businessName,
    shortDescription: row.short_description,
    brandStory: row.brand_story,
    websiteUrl: row.website_url,
    country: row.location ?? "New Zealand",
    department: row.department ?? departments[0] ?? null,
    departments,
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
    categoryGroups,
    offerType: row.offer_type,
    discountValue: row.discount_value,
    discountPercent: row.discount_percent,
    discountLabel: formatPartnerDiscountLabel({
      discount_value: row.discount_value,
      offer_type: row.offer_type,
    }),
    offerScope:
      parseOfferScope(row.offer_scope) ??
      offerScopeFromLegacyAppliesTo(row.offer_applies_to),
    selectedProducts: parseSelectedProducts(row.selected_products),
    offerAppliesTo: row.offer_applies_to,
    bannerImageUrl: row.banner_image_url,
    logoUrl: row.logo_url,
    logoOriginalUrl: row.logo_original_url ?? null,
    logoCrop: parseLogoCrop(row.logo_crop),
    galleryImageUrls: Array.isArray(row.gallery_image_urls)
      ? row.gallery_image_urls
      : [],
    instagram: row.instagram,
    facebook: row.facebook,
    linkedin: row.linkedin,
    tiktok: row.tiktok,
    youtube: row.youtube,
    isFeatured: Boolean(row.is_featured),
    affiliateEnabled: Boolean(row.affiliate_enabled),
    affiliateCommissionPercent: row.affiliate_commission_percent,
    affiliateCookieDurationDays: row.affiliate_cookie_duration_days,
    affiliateProgramDescription: row.affiliate_program_description,
    affiliateTerms: row.affiliate_terms,
  };
}

function buildDevProfile(slug: string): PartnerProfile | null {
  const index = featuredBrands.findIndex(
    (brand) => partnerProfileSlug(brand.name) === slug
  );
  if (index === -1) return null;

  const brand = featuredBrands[index];
  const percent = Number(brand.discount.replace(/[^0-9.]/g, "")) || null;

  return {
    id: `dev-partner-${index + 1}`,
    slug,
    businessName: brand.name,
    shortDescription: brand.description,
    brandStory:
      "Founded on a commitment to quality, this brand has grown into a trusted name across New Zealand. Every product is crafted with care, using locally sourced ingredients and sustainable practices. FoodVault members enjoy exclusive savings as a thank-you for supporting independent producers.",
    websiteUrl: "https://example.com",
    country: "New Zealand",
    department: "Pantry",
    departments: ["Pantry"],
    subcategories: ["Snacks & Sweets", "Baking"],
    categoryGroups: [
      {
        department: "Pantry",
        subcategories: ["Snacks & Sweets", "Baking"],
      },
    ],
    offerType: "Percentage Discount",
    discountValue: brand.discount,
    discountPercent: percent,
    discountLabel: brand.discount,
    offerAppliesTo: "Entire storewide selection",
    offerScope: "entire_store" as const,
    selectedProducts: [],
    bannerImageUrl: brand.image,
    logoUrl: null,
    logoOriginalUrl: null,
    logoCrop: null,
    galleryImageUrls: [
      brand.image,
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=600&h=400&fit=crop",
    ],
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    linkedin: null,
    tiktok: null,
    youtube: null,
    isFeatured: index < 4,
    affiliateEnabled: false,
    affiliateCommissionPercent: null,
    affiliateCookieDurationDays: null,
    affiliateProgramDescription: null,
    affiliateTerms: null,
  };
}

export async function getPartnerProfile(
  slug: string
): Promise<PartnerProfile | null> {
  if (!isSupabaseConfigured()) {
    return buildDevProfile(slug);
  }

  const supabase = await createClient();
  const normalized = slug.trim().toLowerCase();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_public_brand_profile_by_slug",
    { p_slug: normalized }
  );

  if (!rpcError && rpcData) {
    return mapProfileRow(rpcData as ProfileViewRow);
  }

  const { data } = await supabase
    .from("v_public_brand_profile")
    .select("*")
    .eq("slug", normalized)
    .limit(1)
    .maybeSingle();

  if (data) {
    return mapProfileRow(data as ProfileViewRow);
  }

  return getPartnerOwnProfilePreview(normalized);
}

export async function isPartnerAffiliateProgramPublic(
  partnerId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("partner_affiliate_program_is_public", {
    p_partner_id: partnerId,
  });

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function getPartnerDiscountCode(
  partnerId: string
): Promise<{ code: string | null; state: CodeAccessState }> {
  if (!isSupabaseConfigured()) {
    return { code: "FOODVAULT-DEV-15", state: "visible" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: code } = await supabase.rpc(
    "get_partner_discount_code",
    {
      p_partner_id: partnerId,
    }
  );

  if (code) {
    return { code: code as string, state: "visible" };
  }

  if (user) {
    const hasAccess = await memberHasActiveAccess(user.id);
    if (hasAccess) {
      const admin = createAdminClient();
      if (admin) {
        const { data: partner } = await admin
          .from("partners")
          .select(
            "member_code, user_id, application_status_v2, listing_status_v2, suspended"
          )
          .eq("id", partnerId)
          .maybeSingle();

        const isLive =
          partner?.application_status_v2 === "APPROVED" &&
          partner?.listing_status_v2 === "LIVE" &&
          !partner?.suspended;

        if (
          partner?.member_code &&
          isLive &&
          partner.user_id !== user.id
        ) {
          return { code: partner.member_code, state: "visible" };
        }
      }
    }
  }

  if (!user) {
    return { code: null, state: "anon" };
  }

  if (isPartnerUser(user) || (await userHasPartnerRecord(supabase, user.id))) {
    return { code: null, state: "partner-other" };
  }

  return { code: null, state: "member-required" };
}

function isPartnerUser(user: { user_metadata?: Record<string, unknown> }) {
  return user.user_metadata?.account_type === "partner";
}

async function userHasPartnerRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}

export async function getProfileViewerContext(
  partnerId: string
): Promise<ProfileViewerContext> {
  if (!isSupabaseConfigured()) {
    return {
      isLoggedIn: true,
      isPartner: false,
      isActiveMember: false,
      isFreeTrialMember: false,
      isAdmin: false,
      canFavorite: true,
      isFavorited: false,
      isOwnProfile: false,
      ownOnboardingState: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isLoggedIn: false,
      isPartner: false,
      isActiveMember: false,
      isFreeTrialMember: false,
      isAdmin: false,
      canFavorite: false,
      isFavorited: false,
      isOwnProfile: false,
      ownOnboardingState: null,
    };
  }

  const { data: ownPartner } = await supabase
    .from("partners")
    .select("id, application_status_v2, listing_status_v2")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPartner = isPartnerUser(user) || Boolean(ownPartner);
  const admin = await getAdminUser();
  const isAdmin = Boolean(admin);
  const canFavorite = !isPartner && !isAdmin;
  const [{ isActiveMember }, { isFreeTrialMember }] = await Promise.all([
    getActiveMemberView(),
    getFreeTrialMemberView(),
  ]);

  let isFavorited = false;
  if (canFavorite) {
    const { data } = await supabase
      .from("member_favorites")
      .select("partner_id")
      .eq("member_auth_user_id", user.id)
      .eq("partner_id", partnerId)
      .maybeSingle();
    isFavorited = Boolean(data);
  }

  let isOwnProfile = false;
  let ownOnboardingState: PartnerOnboardingState | null = null;

  if (ownPartner && ownPartner.id === partnerId) {
    isOwnProfile = true;
    ownOnboardingState = resolvePartnerOnboardingState(
      ownPartner.application_status_v2 as string,
      ownPartner.listing_status_v2 as string
    );
  }

  return {
    isLoggedIn: true,
    isPartner,
    isActiveMember,
    isFreeTrialMember,
    isAdmin,
    canFavorite,
    isFavorited,
    isOwnProfile,
    ownOnboardingState,
  };
}

function mapListingRow(row: Record<string, unknown>): BrandCard {
  const businessName = formatBusinessName(String(row.business_name ?? ""));
  const categoryGroups = resolveCategoryGroupsFromRecord(row);
  const departments =
    Array.isArray(row.primary_categories) && row.primary_categories.length > 0
      ? (row.primary_categories as string[]).filter(Boolean)
      : getDepartmentsFromGroups(categoryGroups);

  return {
    id: row.id as string,
    businessName,
    slug:
      (row.slug as string | null) ||
      partnerProfileSlug(businessName),
    shortDescription: (row.short_description as string | null) ?? null,
    department: (row.department as string | null) ?? departments[0] ?? null,
    departments,
    subcategories: Array.isArray(row.subcategories)
      ? (row.subcategories as string[])
      : [],
    dietaryLifestyleAttributes: [],
    offerType: (row.offer_type as string | null) ?? null,
    discountLabel: formatPartnerDiscountLabel({
      discount_value: row.discount_value as string | null,
      offer_type: row.offer_type as string | null,
    }),
    discountPercent: (row.discount_percent as number | null) ?? null,
    bannerImageUrl: (row.banner_image_url as string | null) ?? null,
    logoUrl: (row.logo_url as string | null) ?? null,
    logoOriginalUrl: (row.logo_original_url as string | null) ?? null,
    logoCrop: parseLogoCrop(row.logo_crop),
    location: (row.location as string | null) ?? "New Zealand",
    isFeatured: Boolean(row.is_featured),
  };
}

export async function getRecommendedBrands(
  partnerId: string,
  profile?: Pick<PartnerProfile, "department" | "subcategories" | "offerType">,
  limit = 4
): Promise<BrandCard[]> {
  if (!isSupabaseConfigured()) {
    return featuredBrands
      .map((brand, index) => ({
        id: `dev-partner-${index + 1}`,
        businessName: brand.name,
        slug: partnerProfileSlug(brand.name),
        shortDescription: brand.description,
        department: "Pantry",
        departments: ["Pantry"],
        subcategories: [] as string[],
        dietaryLifestyleAttributes: [] as string[],
        offerType: "Percentage Discount",
        discountLabel: brand.discount,
        discountPercent: Number(brand.discount.replace(/[^0-9.]/g, "")) || null,
        bannerImageUrl: brand.image,
        logoUrl: null,
        logoOriginalUrl: null,
        logoCrop: null,
        location: "New Zealand",
        isFeatured: index < 4,
      }))
      .filter((brand) => brand.id !== partnerId)
      .slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_recommended_brands", {
    p_partner_id: partnerId,
    p_limit: limit,
  });

  if (!error && data?.length) {
    return (data as Record<string, unknown>[]).map(mapListingRow);
  }

  return getSimilarBrandsLegacy(partnerId, profile?.department ?? null, limit);
}

/** @deprecated Prefer getRecommendedBrands RPC. Kept as fallback when migration is not applied. */
async function getSimilarBrandsLegacy(
  partnerId: string,
  department: string | null,
  limit = 4
): Promise<BrandCard[]> {
  const supabase = await createClient();
  let query = supabase
    .from("v_public_brand_listings")
    .select(
      "id, slug, business_name, short_description, department, primary_categories, category_groups, subcategories, offer_type, discount_value, discount_percent, banner_image_url, logo_url, logo_original_url, logo_crop, location, is_featured, featured_rank"
    )
    .neq("id", partnerId)
    .order("featured_rank", { ascending: false })
    .limit(limit);

  if (department) {
    query = query.eq("department", department);
  }

  const { data } = await query;
  return (data ?? []).map((row) => mapListingRow(row as Record<string, unknown>));
}

/** @deprecated Use getRecommendedBrands instead. */
export async function getSimilarBrands(
  partnerId: string,
  department: string | null,
  limit = 4
): Promise<BrandCard[]> {
  return getRecommendedBrands(partnerId, { department, subcategories: [], offerType: null }, limit);
}
