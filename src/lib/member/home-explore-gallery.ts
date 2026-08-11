import { resolvePrimaryDepartment } from "@/data/partner-categories";
import { isSupabaseConfigured } from "@/lib/auth";
import { formatBusinessName } from "@/lib/business-name";
import { featuredBrands } from "@/data/homepage";
import {
  formatPartnerDiscountLabel,
  partnerProfileSlug,
} from "@/lib/member/favorites-utils";
import { parseLogoCrop, type LogoCropSettings } from "@/lib/partner-logo-crop";
import { createPublicReadClient } from "@/lib/supabase/public-read";

export type HomeExploreGalleryItem = {
  id: string;
  imageUrl: string;
  partnerId: string;
  partnerSlug: string;
  businessName: string;
  department: string | null;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: LogoCropSettings | null;
  memberOfferLabel: string;
};

const DEV_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=750&fit=crop",
  "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=750&fit=crop",
  "https://images.unsplash.com/photo-1606923829579-0cb981a196e0?w=600&h=750&fit=crop",
];

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getUniqueGalleryUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

function resolveExploreDepartment(row: {
  department?: string | null;
  primary_categories?: string[] | null;
}): string | null {
  const fromDepartment = row.department?.trim();
  if (fromDepartment) {
    return resolvePrimaryDepartment(fromDepartment) ?? fromDepartment;
  }

  const categories = row.primary_categories;
  if (Array.isArray(categories) && categories.length > 0) {
    const first = categories[0]?.trim();
    if (first) {
      return resolvePrimaryDepartment(first) ?? first;
    }
  }

  return null;
}

function buildDevExploreItems(): HomeExploreGalleryItem[] {
  const items: HomeExploreGalleryItem[] = [];

  featuredBrands.forEach((brand, index) => {
    const partnerId = `dev-partner-${index + 1}`;
    const partnerSlug = partnerProfileSlug(brand.name);
    const galleryUrls = getUniqueGalleryUrls([brand.image, ...DEV_GALLERY_IMAGES]);

    galleryUrls.forEach((imageUrl, imageIndex) => {
      items.push({
        id: `${partnerId}-${imageIndex}`,
        imageUrl,
        partnerId,
        partnerSlug,
        businessName: brand.name,
        department: "Pantry",
        logoUrl: brand.image,
        logoOriginalUrl: null,
        logoCrop: null,
        memberOfferLabel: formatPartnerDiscountLabel({
          discount_value: brand.discount.replace(/\s*off\s*$/i, "").trim(),
          offer_type: "percent",
        }),
      });
    });
  });

  return shuffleArray(items);
}

export async function getHomeExploreGalleryItems(): Promise<HomeExploreGalleryItem[]> {
  if (!isSupabaseConfigured()) {
    return buildDevExploreItems();
  }

  const supabase = createPublicReadClient();
  if (!supabase) {
    return buildDevExploreItems();
  }
  const { data, error } = await supabase
    .from("v_public_brand_profile")
    .select(
      "id, slug, business_name, department, primary_categories, gallery_image_urls, logo_url, logo_original_url, logo_crop, offer_type, discount_value"
    );

  if (error || !data?.length) {
    return buildDevExploreItems();
  }

  const items: HomeExploreGalleryItem[] = [];

  for (const row of data) {
    const urls = Array.isArray(row.gallery_image_urls)
      ? (row.gallery_image_urls as string[]).filter(Boolean)
      : [];

    if (urls.length === 0) continue;

    const businessName = formatBusinessName(String(row.business_name ?? ""));
    const partnerId = String(row.id);
    const partnerSlug =
      (row.slug as string | null) || partnerProfileSlug(businessName);
    const department = resolveExploreDepartment({
      department: row.department as string | null,
      primary_categories: row.primary_categories as string[] | null,
    });
    const selected = getUniqueGalleryUrls(urls);

    const logoUrl = (row.logo_url as string | null) ?? null;
    const logoOriginalUrl = (row.logo_original_url as string | null) ?? null;
    const logoCrop = parseLogoCrop(row.logo_crop);
    const memberOfferLabel = formatPartnerDiscountLabel({
      discount_value: row.discount_value as string | null,
      offer_type: row.offer_type as string | null,
    });

    selected.forEach((imageUrl, imageIndex) => {
      items.push({
        id: `${partnerId}-${imageIndex}-${imageUrl}`,
        imageUrl,
        partnerId,
        partnerSlug,
        businessName,
        department,
        logoUrl,
        logoOriginalUrl,
        logoCrop,
        memberOfferLabel,
      });
    });
  }

  if (items.length === 0) {
    return buildDevExploreItems();
  }

  return shuffleArray(items);
}
