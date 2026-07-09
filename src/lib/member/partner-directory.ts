import { isSupabaseConfigured } from "@/lib/auth";
import { formatBusinessName } from "@/lib/business-name";
import {
  formatPartnerDiscountLabel,
  partnerProfileSlug,
} from "@/lib/member/favorites-utils";
import { featuredBrands } from "@/data/homepage";
import { createClient } from "@/lib/supabase/server";

export type PublicPartner = {
  id: string;
  businessName: string;
  slug: string;
  primaryCategory: string | null;
  shortDescription: string | null;
  location: string | null;
  discountLabel: string;
  bannerImageUrl: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  updatedAt: string;
  createdAt: string;
};

function mapPartnerRow(partner: {
  id: string;
  business_name: string | null;
  primary_category: string | null;
  short_description: string | null;
  location: string | null;
  discount_value: string | null;
  offer_type: string | null;
  banner_image_url: string | null;
  logo_url: string | null;
  website_url: string | null;
  updated_at: string;
  created_at: string;
}): PublicPartner | null {
  if (!partner.business_name) return null;

  const businessName = formatBusinessName(partner.business_name);

  return {
    id: partner.id,
    businessName,
    slug: partnerProfileSlug(businessName),
    primaryCategory: partner.primary_category,
    shortDescription: partner.short_description,
    location: partner.location ?? "New Zealand",
    discountLabel: formatPartnerDiscountLabel(partner),
    bannerImageUrl: partner.banner_image_url,
    logoUrl: partner.logo_url,
    websiteUrl: partner.website_url,
    updatedAt: partner.updated_at,
    createdAt: partner.created_at,
  };
}

export async function getLivePartners(): Promise<PublicPartner[]> {
  if (!isSupabaseConfigured()) {
    return featuredBrands.map((brand, index) => ({
      id: `dev-partner-${index + 1}`,
      businessName: brand.name,
      slug: partnerProfileSlug(brand.name),
      primaryCategory: "Food & Beverage",
      shortDescription: brand.description,
      location: "New Zealand",
      discountLabel: brand.discount,
      bannerImageUrl: brand.image,
      logoUrl: null,
      websiteUrl: null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select(
      "id, business_name, primary_category, short_description, location, discount_value, offer_type, banner_image_url, logo_url, website_url, updated_at, created_at"
    )
    .eq("application_status_v2", "APPROVED")
    .eq("listing_status_v2", "LIVE")
    .order("business_name");

  return (data ?? [])
    .map((partner) => mapPartnerRow(partner))
    .filter((partner): partner is PublicPartner => partner !== null);
}

export async function getPartnerBySlug(slug: string): Promise<PublicPartner | null> {
  const partners = await getLivePartners();
  return partners.find((partner) => partner.slug === slug) ?? null;
}
