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
  expandDepartmentSearchValues,
  flattenDietaryLifestyleAttributes,
  getDepartmentsFromGroups,
  isDietaryLifestyleAttribute,
  parseDietaryLifestyleAttributes,
  resolveCategoryGroupsFromRecord,
  resolvePrimaryDepartment,
  type PrimaryDepartment,
} from "@/data/partner-categories";
import { parseLogoCrop } from "@/lib/partner-logo-crop";

function normalizeStringArrayFilter(
  values: string[] | undefined,
  legacyValue?: string | null
): string[] {
  const fromArray = (values ?? []).map((value) => value.trim()).filter(Boolean);
  if (fromArray.length > 0) {
    return [...new Set(fromArray)];
  }

  const legacy = legacyValue?.trim();
  return legacy ? [legacy] : [];
}

function normalizeDietaryLifestyleFilters(
  values: string[] | undefined,
  legacyValue?: string | null
): string[] {
  return normalizeStringArrayFilter(values, legacyValue).filter(
    isDietaryLifestyleAttribute
  );
}

function resolveSearchFilters(params: BrandSearchParams) {
  const departments = expandDepartmentSearchValues(
    normalizeStringArrayFilter(params.departments, params.department)
  );

  return {
    departments,
    subcategories: normalizeStringArrayFilter(
      params.subcategories,
      params.subcategory
    ),
    dietaryLifestyles: normalizeDietaryLifestyleFilters(
      params.dietaryLifestyles,
      params.dietaryLifestyle
    ),
  };
}

function normalizeBrandDepartments(values: string[]): PrimaryDepartment[] {
  return [
    ...new Set(
      values
        .map((value) => resolvePrimaryDepartment(value))
        .filter((value): value is PrimaryDepartment => value !== null)
    ),
  ];
}

function brandMatchesDepartments(brand: BrandCard, departments: string[]) {
  if (!departments.length) return true;

  const filterDepartments = new Set(
    expandDepartmentSearchValues(departments).map(
      (department) => resolvePrimaryDepartment(department) ?? department
    )
  );
  const brandDepartments = normalizeBrandDepartments([
    ...(brand.department ? [brand.department] : []),
    ...brand.departments,
  ]);

  return brandDepartments.some((department) => filterDepartments.has(department));
}

function postgrestFilterValue(value: string): string {
  if (/[,.()]/.test(value) || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function brandMatchesSubcategories(brand: BrandCard, subcategories: string[]) {
  if (!subcategories.length) return true;

  return subcategories.some((subcategory) =>
    brand.subcategories.includes(subcategory)
  );
}

function brandMatchesDietary(brand: BrandCard, dietaryLifestyles: string[]) {
  if (!dietaryLifestyles.length) return true;

  return dietaryLifestyles.some((attribute) =>
    brand.dietaryLifestyleAttributes.includes(attribute)
  );
}

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
      dietaryLifestyleAttributes: [],
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

  const filters = resolveSearchFilters(params);

  if (filters.departments.length) {
    result = result.filter((brand) =>
      brandMatchesDepartments(brand, filters.departments)
    );
  }

  if (filters.subcategories.length) {
    result = result.filter((brand) =>
      brandMatchesSubcategories(brand, filters.subcategories)
    );
  }

  if (filters.dietaryLifestyles.length) {
    result = result.filter((brand) =>
      brandMatchesDietary(brand, filters.dietaryLifestyles)
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

  const filters = resolveSearchFilters(params);
  const normalizedParams = { ...params, ...filters };
  const supabase = await createClient();

  const rpcArgs: Record<string, string | number | string[] | null> = {
    p_search: params.search?.trim() || null,
    p_departments: filters.departments.length ? filters.departments : null,
    p_subcategories: filters.subcategories.length ? filters.subcategories : null,
    p_dietary_lifestyles: filters.dietaryLifestyles.length
      ? filters.dietaryLifestyles
      : null,
    p_min_discount: params.minDiscount ?? null,
    p_sort: params.sort ?? "featured",
    p_limit: limit,
    p_offset: offset,
  };

  const { data, error } = await supabase.rpc("search_public_brands", rpcArgs);

  if (!error && data) {
    const brands = (data as RpcBrandRow[]).map(mapRpcRow);
    const total = data.length > 0 ? Number((data[0] as RpcBrandRow).total_count) : 0;

    if (!(brands.length === 0 && total === 0 && offset === 0)) {
      return { brands, total };
    }
  }

  if (filters.dietaryLifestyles.length) {
    const fromPartners = await searchPublicBrandsFromPartners(normalizedParams);
    if (fromPartners) return fromPartners;
  }

  return searchPublicBrandsFromView(normalizedParams);
}

async function searchPublicBrandsFromView(
  params: BrandSearchParams
): Promise<BrandSearchResult> {
  const filters = resolveSearchFilters(params);
  if (filters.dietaryLifestyles.length) {
    const fromPartners = await searchPublicBrandsFromPartners(params);
    if (fromPartners) return fromPartners;
    return { brands: [], total: 0 };
  }

  const limit = params.limit ?? BROWSE_PAGE_SIZE;
  const offset = params.offset ?? 0;
  const supabase = await createClient();

  let query = supabase
    .from("v_public_brand_listings")
    .select(PUBLIC_BRAND_LISTING_SELECT, { count: "exact" });

  if (filters.departments.length) {
    const orParts = filters.departments.flatMap((department) => {
      const quoted = postgrestFilterValue(department);
      return [
        `department.eq.${quoted}`,
        `primary_categories.cs.{${quoted}}`,
      ];
    });
    query = query.or(orParts.join(","));
  }

  if (filters.subcategories.length) {
    const orParts = filters.subcategories.map(
      (subcategory) => `subcategories.cs.{"${subcategory}"}`
    );
    query = query.or(orParts.join(","));
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

/** Fallback when the public listings view/RPC do not yet expose dietary filters. */
async function searchPublicBrandsFromPartners(
  params: BrandSearchParams
): Promise<BrandSearchResult | null> {
  const filters = resolveSearchFilters(params);
  if (!filters.dietaryLifestyles.length) return null;

  const limit = params.limit ?? BROWSE_PAGE_SIZE;
  const offset = params.offset ?? 0;
  const supabase = await createClient();

  let query = supabase
    .from("partners")
    .select(
      "id, slug, business_name, short_description, primary_category, primary_categories, category_groups, subcategories, dietary_lifestyle_attributes, offer_type, discount_value, discount_percent, banner_image_url, logo_url, logo_original_url, logo_crop, location, approved_at, updated_at, featured_until, featured_rank",
      { count: "exact" }
    );

  const dietaryOrParts = filters.dietaryLifestyles.map(
    (attribute) => `dietary_lifestyle_attributes.cs.{"${attribute}"}`
  );
  query = query.or(dietaryOrParts.join(","));

  if (filters.departments.length) {
    const orParts = filters.departments.flatMap((department) => {
      const quoted = postgrestFilterValue(department);
      return [
        `primary_category.eq.${quoted}`,
        `primary_categories.cs.{${quoted}}`,
      ];
    });
    query = query.or(orParts.join(","));
  }

  if (filters.subcategories.length) {
    const orParts = filters.subcategories.map(
      (subcategory) => `subcategories.cs.{"${subcategory}"}`
    );
    query = query.or(orParts.join(","));
  }

  if (params.minDiscount) {
    query = query.gte("discount_percent", params.minDiscount);
  }

  const searchTerm = params.search?.trim();
  if (searchTerm) {
    const term = `%${searchTerm}%`;
    query = query.or(
      `business_name.ilike.${term},short_description.ilike.${term},primary_category.ilike.${term}`
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
      query = query.order("featured_rank", { ascending: false, nullsFirst: false });
      break;
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error || !data) return null;

  return {
    brands: data.map((row) =>
      mapViewRow({
        id: row.id as string,
        slug: (row.slug as string | null) ?? null,
        business_name: row.business_name as string,
        short_description: (row.short_description as string | null) ?? null,
        department: (row.primary_category as string | null) ?? null,
        primary_categories: (row.primary_categories as string[] | null) ?? null,
        category_groups: row.category_groups,
        subcategories: (row.subcategories as string[] | null) ?? null,
        dietary_lifestyle_attributes:
          (row.dietary_lifestyle_attributes as string[] | null) ?? null,
        offer_type: (row.offer_type as string | null) ?? null,
        discount_value: (row.discount_value as string | null) ?? null,
        discount_percent: (row.discount_percent as number | null) ?? null,
        banner_image_url: (row.banner_image_url as string | null) ?? null,
        logo_url: (row.logo_url as string | null) ?? null,
        logo_original_url: (row.logo_original_url as string | null) ?? null,
        logo_crop: row.logo_crop,
        location: (row.location as string | null) ?? null,
        is_featured: Boolean(
          row.featured_until && new Date(String(row.featured_until)) > new Date()
        ),
      })
    ),
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
  dietary_lifestyle_attributes?: string[] | null;
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
  const rawDepartments =
    Array.isArray(row.primary_categories) && row.primary_categories.length > 0
      ? row.primary_categories.filter(
          (value): value is string => typeof value === "string" && value.length > 0
        )
      : getDepartmentsFromGroups(categoryGroups);
  const departments = normalizeBrandDepartments(
    rawDepartments.length > 0
      ? rawDepartments
      : getDepartmentsFromGroups(categoryGroups)
  );

  const dietaryFromColumn = parseDietaryLifestyleAttributes(
    row.dietary_lifestyle_attributes
  );
  const dietaryLifestyleAttributes =
    dietaryFromColumn.length > 0
      ? dietaryFromColumn
      : flattenDietaryLifestyleAttributes(categoryGroups);

  return {
    id: row.id,
    businessName,
    slug: row.slug || partnerProfileSlug(businessName),
    shortDescription: row.short_description,
    department:
      resolvePrimaryDepartment(row.department ?? "") ?? departments[0] ?? null,
    departments,
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
    dietaryLifestyleAttributes,
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
