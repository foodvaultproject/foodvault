import { isSupabaseConfigured } from "@/lib/auth";
import { formatBusinessName } from "@/lib/business-name";
import { featuredBrands } from "@/data/homepage";
import {
  formatPartnerDiscountLabel,
  parseDiscountSortValue,
  partnerProfileSlug,
} from "@/lib/member/favorites-utils";
import {
  BROWSE_PAGE_SIZE,
  type BrandCard,
  type BrandSearchParams,
  type BrandSearchResult,
} from "@/lib/member/browse-brands-types";
import { createClient } from "@/lib/supabase/server";
import {
  getDepartmentsFromGroups,
  resolveCategoryGroupsFromRecord,
} from "@/data/partner-categories";
import { parseLogoCrop } from "@/lib/partner-logo-crop";

export {
  BROWSE_PAGE_SIZE,
  type BrandCard,
  type BrandSearchParams,
  type BrandSearchResult,
  type BrandSortOption,
} from "@/lib/member/browse-brands-types";

function buildDevBrands(): BrandCard[] {
  return featuredBrands.map((brand, index) => {
    const discountPercent = parseDiscountSortValue(brand.discount) || null;
    return {
      id: `dev-partner-${index + 1}`,
      businessName: brand.name,
      slug: partnerProfileSlug(brand.name),
      shortDescription: brand.description,
      department: "Pantry",
      departments: ["Pantry"],
      subcategories: [],
      offerType: "percentage",
      discountLabel: brand.discount,
      discountPercent,
      bannerImageUrl: brand.image,
      logoUrl: null,
      logoOriginalUrl: null,
      logoCrop: null,
      location: "New Zealand",
      isFeatured: index < 4,
    } satisfies BrandCard;
  });
}

function applyDevFilters(
  brands: BrandCard[],
  params: BrandSearchParams
): BrandCard[] {
  let result = [...brands];
  const search = params.search?.trim().toLowerCase();

  if (search) {
    result = result.filter(
      (brand) =>
        brand.businessName.toLowerCase().includes(search) ||
        (brand.shortDescription?.toLowerCase().includes(search) ?? false) ||
        (brand.department?.toLowerCase().includes(search) ?? false)
    );
  }

  if (params.department) {
    result = result.filter(
      (brand) =>
        brand.department === params.department ||
        brand.departments.includes(params.department as string)
    );
  }

  if (params.subcategory) {
    result = result.filter((brand) =>
      brand.subcategories.includes(params.subcategory as string)
    );
  }

  if (params.minDiscount) {
    result = result.filter(
      (brand) => (brand.discountPercent ?? 0) >= (params.minDiscount as number)
    );
  }

  switch (params.sort) {
    case "highest-discount":
      result.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
      break;
    case "alphabetical":
      result.sort((a, b) => a.businessName.localeCompare(b.businessName));
      break;
    case "featured":
      result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
      break;
    default:
      break;
  }

  return result;
}

export async function searchPublicBrands(
  params: BrandSearchParams
): Promise<BrandSearchResult> {
  const limit = params.limit ?? BROWSE_PAGE_SIZE;
  const offset = params.offset ?? 0;

  if (!isSupabaseConfigured()) {
    const filtered = applyDevFilters(buildDevBrands(), params);
    return {
      brands: filtered.slice(offset, offset + limit),
      total: filtered.length,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_public_brands", {
    p_search: params.search?.trim() || null,
    p_department: params.department || null,
    p_subcategory: params.subcategory || null,
    p_min_discount: params.minDiscount ?? null,
    p_sort: params.sort ?? "featured",
    p_limit: limit,
    p_offset: offset,
  });

  if (error || !data) {
    return searchPublicBrandsFromView(params);
  }

  const brands = (data as RpcBrandRow[]).map(mapRpcRow);
  const total = data.length > 0 ? Number((data[0] as RpcBrandRow).total_count) : 0;

  if (brands.length === 0 && total === 0 && offset === 0) {
    return searchPublicBrandsFromView(params);
  }

  return { brands, total };
}

async function searchPublicBrandsFromView(
  params: BrandSearchParams
): Promise<BrandSearchResult> {
  const limit = params.limit ?? BROWSE_PAGE_SIZE;
  const offset = params.offset ?? 0;
  const supabase = await createClient();

  let query = supabase
    .from("v_public_brand_listings")
    .select(PUBLIC_BRAND_LISTING_SELECT, { count: "exact" });

  if (params.department) {
    query = query.or(
      `department.eq.${params.department},primary_categories.cs.{"${params.department}"}`
    );
  }

  if (params.subcategory) {
    query = query.contains("subcategories", [params.subcategory]);
  }

  if (params.minDiscount) {
    query = query.gte("discount_percent", params.minDiscount);
  }

  const searchTerm = params.search?.trim();
  if (searchTerm) {
    const term = `%${searchTerm}%`;
    query = query.or(
      `business_name.ilike.${term},short_description.ilike.${term},department.ilike.${term}`
    );
  }

  switch (params.sort) {
    case "highest-discount":
      query = query.order("discount_percent", { ascending: false, nullsFirst: false });
      break;
    case "alphabetical":
      query = query.order("business_name", { ascending: true });
      break;
    case "newest":
      query = query.order("approved_at", { ascending: false });
      break;
    case "recently-updated":
      query = query.order("updated_at", { ascending: false });
      break;
    case "featured":
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("featured_rank", { ascending: false, nullsFirst: false });
      break;
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error || !data) {
    return { brands: [], total: 0 };
  }

  return {
    brands: (data as ViewBrandRow[]).map(mapViewRow),
    total: count ?? data.length,
  };
}

export type PartnerLogoItem = {
  id: string;
  businessName: string;
  slug: string;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: import("@/lib/partner-logo-crop").LogoCropSettings | null;
  bannerImageUrl: string | null;
};

export async function getPartnerLogos(limit = 40): Promise<PartnerLogoItem[]> {
  if (!isSupabaseConfigured()) {
    return featuredBrands.map((brand, index) => ({
      id: `dev-partner-${index + 1}`,
      businessName: brand.name,
      slug: partnerProfileSlug(brand.name),
      logoUrl: null,
      logoOriginalUrl: null,
      logoCrop: null,
      bannerImageUrl: brand.image,
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("v_public_brand_listings")
    .select(
      "id, business_name, slug, logo_url, logo_original_url, logo_crop, banner_image_url"
    )
    .order("business_name")
    .limit(limit);

  return (data ?? []).map((row) => {
    const businessName = formatBusinessName(row.business_name as string);

    return {
      id: row.id as string,
      businessName,
      slug:
        (row.slug as string | null) ||
        partnerProfileSlug(businessName),
      logoUrl: (row.logo_url as string | null) ?? null,
      logoOriginalUrl: (row.logo_original_url as string | null) ?? null,
      logoCrop: parseLogoCrop(row.logo_crop),
      bannerImageUrl: (row.banner_image_url as string | null) ?? null,
    };
  });
}

/** Featured partners for the homepage, falling back to newest live brands. */
export async function getHomepageFeaturedBrands(limit = 6): Promise<BrandCard[]> {
  const featured = await getFeaturedBrands(limit);
  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }

  const fallback = await searchPublicBrands({
    sort: "newest",
    limit,
    offset: 0,
  });

  const seen = new Set(featured.map((brand) => brand.id));
  const merged = [...featured];
  for (const brand of fallback.brands) {
    if (merged.length >= limit) break;
    if (!seen.has(brand.id)) {
      merged.push(brand);
      seen.add(brand.id);
    }
  }
  return merged;
}

const PUBLIC_BRAND_LISTING_SELECT =
  "id, slug, business_name, short_description, department, primary_categories, category_groups, subcategories, offer_type, discount_value, discount_percent, banner_image_url, logo_url, logo_original_url, logo_crop, location, is_featured, featured_rank";

export async function getRecentBrandCards(limit = 3): Promise<BrandCard[]> {
  if (!isSupabaseConfigured()) {
    return buildDevBrands().slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_public_brand_listings")
    .select(PUBLIC_BRAND_LISTING_SELECT)
    .order("approved_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as ViewBrandRow[]).map(mapViewRow);
}

export async function getFeaturedBrands(limit = 8): Promise<BrandCard[]> {
  if (!isSupabaseConfigured()) {
    return buildDevBrands().filter((brand) => brand.isFeatured).slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_public_brand_listings")
    .select(PUBLIC_BRAND_LISTING_SELECT)
    .eq("is_featured", true)
    .order("featured_rank", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as ViewBrandRow[]).map(mapViewRow);
}

type RpcBrandRow = {
  id: string;
  slug: string | null;
  business_name: string;
  short_description: string | null;
  department: string | null;
  primary_categories: string[] | null;
  category_groups: unknown;
  subcategories: string[] | null;
  offer_type: string | null;
  discount_value: string | null;
  discount_percent: number | null;
  banner_image_url: string | null;
  logo_url: string | null;
  logo_original_url: string | null;
  logo_crop: unknown;
  location: string | null;
  is_featured: boolean;
  total_count: number;
};

type ViewBrandRow = Omit<RpcBrandRow, "total_count">;

function mapRpcRow(row: RpcBrandRow): BrandCard {
  return mapViewRow(row);
}

function mapViewRow(row: ViewBrandRow): BrandCard {
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
    businessName,
    slug: row.slug || partnerProfileSlug(businessName),
    shortDescription: row.short_description,
    department: row.department ?? departments[0] ?? null,
    departments,
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
    offerType: row.offer_type,
    discountLabel: formatPartnerDiscountLabel({
      discount_value: row.discount_value,
      offer_type: row.offer_type,
    }),
    discountPercent: row.discount_percent,
    bannerImageUrl: row.banner_image_url,
    logoUrl: row.logo_url,
    logoOriginalUrl: row.logo_original_url ?? null,
    logoCrop: parseLogoCrop(row.logo_crop),
    location: row.location ?? "New Zealand",
    isFeatured: Boolean(row.is_featured),
  };
}
