import { isSupabaseConfigured } from "@/lib/auth";
import { formatBusinessName } from "@/lib/business-name";
import {
  formatPartnerDiscountLabel,
  partnerProfileSlug,
} from "@/lib/member/favorites-utils";
import { createClient } from "@/lib/supabase/server";
import { parseLogoCrop, type LogoCropSettings } from "@/lib/partner-logo-crop";

export type FavoritePartner = {
  favoriteId: string;
  partnerId: string;
  savedAt: string;
  businessName: string;
  slug: string;
  primaryCategory: string | null;
  shortDescription: string | null;
  location: string | null;
  discountLabel: string;
  bannerImageUrl: string | null;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: LogoCropSettings | null;
  websiteUrl: string | null;
  updatedAt: string;
  partnerCreatedAt: string;
  keywords: string;
};

const DEV_FAVORITES: FavoritePartner[] = [
  {
    favoriteId: "dev-1",
    partnerId: "dev-partner-1",
    savedAt: new Date(Date.now() - 86400000).toISOString(),
    businessName: "Aura Coffee Roasters",
    slug: "aura-coffee-roasters",
    primaryCategory: "Coffee & Beverage",
    shortDescription:
      "Premium small-batch roasts sourced directly from sustainable high-altitude farms across New Zealand.",
    location: "Auckland, New Zealand",
    discountLabel: "15% Off Storewide",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop",
    logoUrl: null,
    logoOriginalUrl: null,
    logoCrop: null,
    websiteUrl: "https://example.com",
    updatedAt: new Date().toISOString(),
    partnerCreatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    keywords: "coffee beverage roasters",
  },
  {
    favoriteId: "dev-2",
    partnerId: "dev-partner-2",
    savedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    businessName: "PureRoot Organic",
    slug: "pureroot-organic",
    primaryCategory: "Health Foods",
    shortDescription:
      "Certified organic pantry staples and fresh produce for everyday wellness.",
    location: "Wellington, New Zealand",
    discountLabel: "20% Off Storewide",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=400&fit=crop",
    logoUrl: null,
    logoOriginalUrl: null,
    logoCrop: null,
    websiteUrl: "https://example.com",
    updatedAt: new Date().toISOString(),
    partnerCreatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    keywords: "organic health pantry",
  },
];

export async function getMemberFavoritePartners(
  memberAuthUserId: string
): Promise<FavoritePartner[]> {
  if (!isSupabaseConfigured()) {
    return DEV_FAVORITES;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("member_favorites")
    .select(
      `
      id,
      created_at,
      partner:partners (
        id,
        business_name,
        primary_category,
        short_description,
        location,
        discount_value,
        offer_type,
        banner_image_url,
        logo_url,
        logo_original_url,
        logo_crop,
        website_url,
        updated_at,
        created_at,
        subcategories
      )
    `
    )
    .eq("member_auth_user_id", memberAuthUserId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => {
      const partner = Array.isArray(row.partner) ? row.partner[0] : row.partner;
      if (!partner?.business_name) return null;

      const subcategories = Array.isArray(partner.subcategories)
        ? partner.subcategories.join(" ")
        : "";

      const businessName = formatBusinessName(partner.business_name);

      return {
        favoriteId: row.id,
        partnerId: partner.id,
        savedAt: row.created_at,
        businessName,
        slug: partnerProfileSlug(businessName),
        primaryCategory: partner.primary_category,
        shortDescription: partner.short_description,
        location: partner.location ?? "New Zealand",
        discountLabel: formatPartnerDiscountLabel(partner),
        bannerImageUrl: partner.banner_image_url,
        logoUrl: partner.logo_url,
        logoOriginalUrl: partner.logo_original_url ?? null,
        logoCrop: parseLogoCrop(partner.logo_crop),
        websiteUrl: partner.website_url,
        updatedAt: partner.updated_at ?? partner.created_at,
        partnerCreatedAt: partner.created_at,
        keywords: `${businessName} ${partner.primary_category ?? ""} ${partner.short_description ?? ""} ${subcategories}`.toLowerCase(),
      } satisfies FavoritePartner;
    })
    .filter((item): item is FavoritePartner => item !== null);
}

export async function isPartnerFavorited(
  memberAuthUserId: string,
  partnerId: string
) {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("member_favorites")
    .select("id")
    .eq("member_auth_user_id", memberAuthUserId)
    .eq("partner_id", partnerId)
    .maybeSingle();

  return Boolean(data);
}
