import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getDepartmentsFromGroups,
  resolveCategoryGroupsFromRecord,
  type PrimaryDepartment,
} from "@/data/partner-categories";
import type { DiscoverCategory } from "@/lib/admin/types";
import { formatBusinessName } from "@/lib/business-name";
import { normalizeDiscoverCategory } from "@/lib/discover/categories";
import { formatPartnerDiscountLabel } from "@/lib/member/favorites-utils";
import {
  offerScopeFromLegacyAppliesTo,
  parseOfferScope,
  parseSelectedProducts,
  type OfferScope,
  type SelectedProduct,
} from "@/lib/partner-offer";
import { parseSystemSettingsRow } from "@/lib/system-settings";
import { fetchSystemSettingsRow } from "@/lib/system-settings-db";
import { parseVaultDropStored, type VaultDropStored } from "@/lib/vault-drop";

export const BLOG_ROTATION_CATEGORIES = [
  "savings",
  "partners",
  "recipes",
  "news",
] as const;

export type BlogRotationCategory = (typeof BLOG_ROTATION_CATEGORIES)[number];

export const CMS_CATEGORY_BY_ROTATION: Record<BlogRotationCategory, DiscoverCategory> =
  {
    savings: "Saving",
    partners: "Brands",
    recipes: "Recipes",
    news: "News",
  };

const ROTATION_BY_CMS: Record<DiscoverCategory, BlogRotationCategory> = {
  Saving: "savings",
  Brands: "partners",
  Recipes: "recipes",
  News: "news",
};

/** 4-day loop: savings/partners on 3 of 4 days; recipes/news share the remaining slot. */
const PRIMARY_LOOP: Array<"savings" | "partners"> = [
  "savings",
  "partners",
  "savings",
];

export const ESSENTIAL_SAVINGS_CATEGORIES = [
  "Meat & Poultry",
  "Fruit & Veg",
  "Pantry",
  "Gift Boxes & Hampers",
] as const;

export type EssentialSavingsCategory = (typeof ESSENTIAL_SAVINGS_CATEGORIES)[number];

const RECIPE_DEPARTMENTS: PrimaryDepartment[] = [
  "Meat & Poultry",
  "Fruit & Veg",
  "Pantry",
  "Bakery",
  "Fridge & Deli",
];

const KIWI_PANTRY_STAPLES = [
  { name: "Butter", role: "dairy" },
  { name: "Tasty cheese", role: "dairy" },
  { name: "Eggs", role: "protein" },
  { name: "Milk", role: "dairy" },
  { name: "Plain flour", role: "dry" },
  { name: "Rolled oats", role: "dry" },
  { name: "Wattie's baked beans", role: "pantry" },
  { name: "Marmite", role: "spread" },
  { name: "Potatoes", role: "produce" },
  { name: "Onions", role: "produce" },
  { name: "Carrots", role: "produce" },
  { name: "Beef mince", role: "protein" },
  { name: "Chicken thighs", role: "protein" },
  { name: "Frozen peas", role: "freezer" },
  { name: "Olive oil", role: "pantry" },
  { name: "Lemons", role: "produce" },
] as const;

const PARTNER_SELECT_CORE =
  "id, slug, business_name, short_description, brand_story, description, primary_category, primary_categories, category_groups, subcategories, offer_type, discount_value, discount_percent, offer_scope, offer_applies_to, offer_terms, offer_exclusions, offer_summary, selected_products, vault_drop, gallery_image_urls, banner_image_url, logo_url, approved_at, created_at, listing_model";

const PARTNER_SELECT_WITH_BLOGGED = `${PARTNER_SELECT_CORE}, last_blogged_at`;

const RECENT_ARTICLE_LIMIT = 20;

type PartnerSourceRow = {
  id: string;
  slug: string | null;
  business_name: string | null;
  short_description: string | null;
  brand_story: string | null;
  description: string | null;
  primary_category: string | null;
  primary_categories: string[] | null;
  category_groups: unknown;
  subcategories: string[] | null;
  offer_type: string | null;
  discount_value: string | null;
  discount_percent: number | string | null;
  offer_scope: string | null;
  offer_applies_to: string | null;
  offer_terms: string | null;
  offer_exclusions: string | null;
  offer_summary: string | null;
  selected_products: unknown;
  vault_drop: unknown;
  gallery_image_urls: string[] | null;
  banner_image_url: string | null;
  logo_url: string | null;
  approved_at: string | null;
  created_at: string | null;
  listing_model: string | null;
  last_blogged_at?: string | null;
};

type RecentArticle = {
  title: string;
  category: DiscoverCategory;
  publishDate: string | null;
};

export type PartnerOfferContext = {
  offerType: string | null;
  discountValue: string | null;
  discountPercent: number | null;
  discountLabel: string;
  offerScope: OfferScope;
  offerSummary: string | null;
  offerTerms: string | null;
  offerExclusions: string | null;
  selectedProducts: Array<Pick<SelectedProduct, "name" | "shortDescription" | "discountPercent" | "normalPrice">>;
  vaultDrop: {
    active: boolean;
    discountPercentage: number | null;
    productTitles: string[];
  } | null;
};

export type PartnerBlogContext = {
  id: string;
  slug: string | null;
  businessName: string;
  brandHistory: string | null;
  description: string | null;
  departments: string[];
  galleryImageUrls: string[];
  bannerImageUrl: string | null;
  logoUrl: string | null;
  approvedAt: string | null;
  lastBloggedAt: string | null;
  neverBlogged: boolean;
  offer: PartnerOfferContext;
};

export type SavingsBlogContext = {
  essentialCategory: EssentialSavingsCategory;
  categoryLabel: string;
  membershipPriceMonthly: number;
  trialLengthDays: number;
  partner: PartnerBlogContext | null;
  savingsAngle: string;
};

export type RecipesBlogContext = {
  partner: PartnerBlogContext | null;
  partnerIngredients: Array<{ name: string; shortDescription: string; departmentHint: string | null }>;
  kiwiPantryStaples: Array<{ name: string; role: string }>;
  recipeBrief: string;
};

export type NewsBlogContext = {
  topic: string;
  foodVaultAngle: string;
  openaiInstruction: string;
  membershipPriceMonthly: number;
  recentPartners: Array<{ businessName: string; departments: string[]; approvedAt: string | null }>;
};

export type BlogGenerationPayload =
  | {
      category: "partners";
      cmsCategory: "Brands";
      selectionReason: string;
      context: PartnerBlogContext | null;
    }
  | {
      category: "savings";
      cmsCategory: "Saving";
      selectionReason: string;
      context: SavingsBlogContext;
    }
  | {
      category: "recipes";
      cmsCategory: "Recipes";
      selectionReason: string;
      context: RecipesBlogContext;
    }
  | {
      category: "news";
      cmsCategory: "News";
      selectionReason: string;
      context: NewsBlogContext;
    };

function isMissingColumnError(error: { message?: string } | null) {
  if (!error?.message) return false;
  return /could not find the .* column|column .* does not exist|schema cache/i.test(error.message);
}

function utcDayIndex(date: Date) {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
}

function pickRandom<T>(items: readonly T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

function partnerDepartments(row: PartnerSourceRow): string[] {
  const fromGroups = getDepartmentsFromGroups(resolveCategoryGroupsFromRecord(row));
  if (fromGroups.length > 0) return fromGroups;
  if (row.primary_category) return [row.primary_category];
  return [];
}

function partnerHasDepartment(row: PartnerSourceRow, department: string) {
  return partnerDepartments(row).includes(department);
}

function parseDiscountPercent(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapOffer(row: PartnerSourceRow): PartnerOfferContext {
  const selectedProducts = parseSelectedProducts(row.selected_products).map((product) => ({
    name: product.name,
    shortDescription: product.shortDescription,
    discountPercent: product.discountPercent,
    normalPrice: product.normalPrice,
  }));
  const vaultDrop = parseVaultDropStored(row.vault_drop);
  const vaultActive = isVaultDropActive(vaultDrop);

  return {
    offerType: row.offer_type,
    discountValue: row.discount_value,
    discountPercent: parseDiscountPercent(row.discount_percent),
    discountLabel: formatPartnerDiscountLabel(row),
    offerScope: row.offer_scope
      ? parseOfferScope(row.offer_scope)
      : offerScopeFromLegacyAppliesTo(row.offer_applies_to),
    offerSummary: row.offer_summary,
    offerTerms: row.offer_terms,
    offerExclusions: row.offer_exclusions,
    selectedProducts,
    vaultDrop:
      vaultDrop && vaultActive
        ? {
            active: true,
            discountPercentage: vaultDrop.discount_percentage,
            productTitles: vaultDrop.products.map((product) => product.title).filter(Boolean),
          }
        : null,
  };
}

function isVaultDropActive(vaultDrop: VaultDropStored | null): boolean {
  if (!vaultDrop || vaultDrop.products.length === 0) return false;
  if (!vaultDrop.countdown_end_time) return true;
  const endsAt = Date.parse(vaultDrop.countdown_end_time);
  return Number.isFinite(endsAt) && endsAt > Date.now();
}

function mapPartnerContext(
  row: PartnerSourceRow,
  options: { neverBlogged: boolean }
): PartnerBlogContext {
  const businessName = formatBusinessName(row.business_name ?? "") || row.business_name?.trim() || "Partner";
  return {
    id: row.id,
    slug: row.slug,
    businessName,
    brandHistory: row.brand_story?.trim() || row.description?.trim() || null,
    description: row.short_description?.trim() || row.description?.trim() || null,
    departments: partnerDepartments(row),
    galleryImageUrls: Array.isArray(row.gallery_image_urls) ? row.gallery_image_urls.filter(Boolean) : [],
    bannerImageUrl: row.banner_image_url,
    logoUrl: row.logo_url,
    approvedAt: row.approved_at,
    lastBloggedAt: row.last_blogged_at ?? null,
    neverBlogged: options.neverBlogged,
    offer: mapOffer(row),
  };
}

function partnerMentioned(businessName: string, articles: RecentArticle[]) {
  const needle = businessName.trim().toLowerCase();
  if (!needle) return false;
  return articles.some((article) => article.title.toLowerCase().includes(needle));
}

function countRecentCategories(articles: RecentArticle[]) {
  const counts: Record<BlogRotationCategory, number> = {
    savings: 0,
    partners: 0,
    recipes: 0,
    news: 0,
  };
  for (const article of articles) {
    counts[ROTATION_BY_CMS[article.category]] += 1;
  }
  return counts;
}

export function selectBlogCategory(
  recentArticles: RecentArticle[],
  now = new Date()
): { category: BlogRotationCategory; reason: string } {
  const slot = utcDayIndex(now) % 4;
  const counts = countRecentCategories(recentArticles);
  const lastCategory = recentArticles[0] ? ROTATION_BY_CMS[recentArticles[0].category] : null;

  let category: BlogRotationCategory;
  let reason: string;

  if (slot < 3) {
    category = PRIMARY_LOOP[slot] ?? "savings";
    reason = `4-day loop slot ${slot} prefers ${category}`;
  } else {
    const scheduledSecondary = Math.floor(utcDayIndex(now) / 4) % 2 === 0 ? "recipes" : "news";
    const otherSecondary = scheduledSecondary === "recipes" ? "news" : "recipes";
    category =
      counts[scheduledSecondary] > counts[otherSecondary] + 1
        ? otherSecondary
        : scheduledSecondary;
    reason = `4-day loop slot ${slot} is a secondary day; scheduled ${scheduledSecondary}, selected ${category}`;
  }

  if (lastCategory === category) {
    const fallbackOrder: BlogRotationCategory[] =
      category === "savings" || category === "partners"
        ? ["partners", "savings", "recipes", "news"]
        : ["savings", "partners", category === "recipes" ? "news" : "recipes"];
    const next = fallbackOrder.find((item) => item !== lastCategory) ?? "savings";
    reason = `${reason}; last article was also ${category}, so rotated to ${next}`;
    category = next;
  }

  return { category, reason };
}

async function fetchRecentArticles(admin: SupabaseClient): Promise<RecentArticle[]> {
  const { data, error } = await admin
    .from("discover_articles")
    .select("title, category, publish_date, created_at, status")
    .in("status", ["PUBLISHED", "DRAFT"])
    .order("publish_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(RECENT_ARTICLE_LIMIT);

  if (error) {
    throw new Error(`Failed to load recent articles: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => {
      const category = normalizeDiscoverCategory(String(row.category ?? ""));
      if (!category) return null;
      return {
        title: String(row.title ?? ""),
        category,
        publishDate: (row.publish_date as string | null) ?? (row.created_at as string | null),
      };
    })
    .filter((row): row is RecentArticle => row !== null);
}

async function fetchLivePartners(admin: SupabaseClient): Promise<PartnerSourceRow[]> {
  const first = await admin
    .from("partners")
    .select(PARTNER_SELECT_WITH_BLOGGED)
    .eq("application_status_v2", "APPROVED")
    .eq("listing_status_v2", "LIVE")
    .eq("suspended", false)
    .is("deleted_at", null);

  let rows = (first.data ?? null) as PartnerSourceRow[] | null;
  let error = first.error;

  if (error && isMissingColumnError(error)) {
    const fallback = await admin
      .from("partners")
      .select(PARTNER_SELECT_CORE)
      .eq("application_status_v2", "APPROVED")
      .eq("listing_status_v2", "LIVE")
      .eq("suspended", false)
      .is("deleted_at", null);
    rows = (fallback.data ?? null) as PartnerSourceRow[] | null;
    error = fallback.error;
  }

  if (error) {
    throw new Error(`Failed to load partners: ${error.message}`);
  }

  return rows ?? [];
}

function onboardedAt(row: PartnerSourceRow) {
  return Date.parse(row.approved_at ?? row.created_at ?? "") || 0;
}

function selectPartnerForSpotlight(
  partners: PartnerSourceRow[],
  recentArticles: RecentArticle[]
): PartnerSourceRow | null {
  if (partners.length === 0) return null;

  const brandArticles = recentArticles.filter((article) => article.category === "Brands");
  const onlineFirst = partners.filter((row) => row.listing_model !== "hospitality_venue");
  const pool = onlineFirst.length > 0 ? onlineFirst : partners;

  const scored = pool.map((row) => {
    const mentioned = partnerMentioned(row.business_name ?? "", brandArticles);
    const neverBlogged = !row.last_blogged_at && !mentioned;
    return { row, neverBlogged, lastBloggedAt: Date.parse(row.last_blogged_at ?? "") || 0 };
  });

  const neverBlogged = scored.filter((item) => item.neverBlogged);
  const pickFrom = neverBlogged.length > 0 ? neverBlogged : scored;

  pickFrom.sort((a, b) => {
    if (a.neverBlogged !== b.neverBlogged) return a.neverBlogged ? -1 : 1;
    if (a.lastBloggedAt !== b.lastBloggedAt) return a.lastBloggedAt - b.lastBloggedAt;
    return onboardedAt(b.row) - onboardedAt(a.row);
  });

  return pickFrom[0]?.row ?? null;
}

function selectPartnerInCategory(
  partners: PartnerSourceRow[],
  department: string
): PartnerSourceRow | null {
  const matches = partners.filter((row) => partnerHasDepartment(row, department));
  return pickRandom(matches) ?? pickRandom(partners);
}

function selectRecipePartner(partners: PartnerSourceRow[]): PartnerSourceRow | null {
  const withProducts = partners.filter((row) => {
    const departments = partnerDepartments(row);
    const inFoodDept = departments.some((department) =>
      RECIPE_DEPARTMENTS.includes(department as PrimaryDepartment)
    );
    return inFoodDept && parseSelectedProducts(row.selected_products).length > 0;
  });
  if (withProducts.length > 0) return pickRandom(withProducts);

  const foodPartners = partners.filter((row) =>
    partnerDepartments(row).some((department) =>
      RECIPE_DEPARTMENTS.includes(department as PrimaryDepartment)
    )
  );
  return pickRandom(foodPartners) ?? pickRandom(partners);
}

function savingsCategoryLabel(category: EssentialSavingsCategory) {
  switch (category) {
    case "Meat & Poultry":
      return "meat";
    case "Fruit & Veg":
      return "produce";
    case "Pantry":
      return "pantry staples";
    case "Gift Boxes & Hampers":
      return "gift hampers";
  }
}

function buildSavingsAngle(
  category: EssentialSavingsCategory,
  partner: PartnerBlogContext | null,
  membershipPriceMonthly: number
) {
  const label = savingsCategoryLabel(category);
  const membership = `FoodVault membership is $${membershipPriceMonthly.toFixed(2)}/month`;
  if (!partner) {
    return `${membership}. Use this post to show how members stretch that fee across everyday ${label} by shopping independent FoodVault brands instead of full supermarket prices.`;
  }
  return `${membership}. Feature ${partner.businessName} (${partner.offer.discountLabel}) to show how members save on ${label} — the membership fee is typically recovered in a single shop when that exclusive offer is used.`;
}

async function loadMembership(admin: SupabaseClient) {
  const row = await fetchSystemSettingsRow(admin);
  const parsed = parseSystemSettingsRow(row);
  return {
    membershipPriceMonthly: parsed.membership_price_monthly,
    trialLengthDays: parsed.trial_length_days,
  };
}

export async function buildBlogGenerationPayload(
  admin: SupabaseClient,
  now = new Date()
): Promise<BlogGenerationPayload> {
  const [recentArticles, partners, membership] = await Promise.all([
    fetchRecentArticles(admin),
    fetchLivePartners(admin),
    loadMembership(admin),
  ]);

  const { category, reason } = selectBlogCategory(recentArticles, now);

  if (category === "partners") {
    const row = selectPartnerForSpotlight(partners, recentArticles);
    const mentioned = row
      ? partnerMentioned(
          row.business_name ?? "",
          recentArticles.filter((article) => article.category === "Brands")
        )
      : false;
    return {
      category: "partners",
      cmsCategory: "Brands",
      selectionReason: reason,
      context: row
        ? mapPartnerContext(row, {
            neverBlogged: !row.last_blogged_at && !mentioned,
          })
        : null,
    };
  }

  if (category === "savings") {
    const essentialCategory =
      ESSENTIAL_SAVINGS_CATEGORIES[utcDayIndex(now) % ESSENTIAL_SAVINGS_CATEGORIES.length] ??
      "Pantry";
    const row = selectPartnerInCategory(partners, essentialCategory);
    const partner = row
      ? mapPartnerContext(row, {
          neverBlogged: !row.last_blogged_at,
        })
      : null;
    return {
      category: "savings",
      cmsCategory: "Saving",
      selectionReason: reason,
      context: {
        essentialCategory,
        categoryLabel: savingsCategoryLabel(essentialCategory),
        membershipPriceMonthly: membership.membershipPriceMonthly,
        trialLengthDays: membership.trialLengthDays,
        partner,
        savingsAngle: buildSavingsAngle(
          essentialCategory,
          partner,
          membership.membershipPriceMonthly
        ),
      },
    };
  }

  if (category === "recipes") {
    const row = selectRecipePartner(partners);
    const partner = row
      ? mapPartnerContext(row, { neverBlogged: !row.last_blogged_at })
      : null;
    const partnerIngredients = partner
      ? partner.offer.selectedProducts.map((product) => ({
          name: product.name,
          shortDescription: product.shortDescription,
          departmentHint: partner.departments[0] ?? null,
        }))
      : [];
    const recipeBrief = partner
      ? `Build a simple Kiwi weeknight recipe that uses ${partner.businessName} products${
          partnerIngredients.length > 0
            ? ` (${partnerIngredients.map((item) => item.name).join(", ")})`
            : ""
        } plus standard pantry staples. Keep it to 4–8 ingredients and note the FoodVault member offer.`
      : "Build a simple Kiwi weeknight recipe from standard pantry staples and note how FoodVault members can source the hero ingredients at member pricing.";

    return {
      category: "recipes",
      cmsCategory: "Recipes",
      selectionReason: reason,
      context: {
        partner,
        partnerIngredients,
        kiwiPantryStaples: KIWI_PANTRY_STAPLES.map((item) => ({ ...item })),
        recipeBrief,
      },
    };
  }

  const recentPartners = [...partners]
    .sort((a, b) => onboardedAt(b) - onboardedAt(a))
    .slice(0, 4)
    .map((row) => ({
      businessName: formatBusinessName(row.business_name ?? "") || row.business_name?.trim() || "Partner",
      departments: partnerDepartments(row),
      approvedAt: row.approved_at,
    }));

  return {
    category: "news",
    cmsCategory: "News",
    selectionReason: reason,
    context: {
      topic: "NZ food inflation and supermarket pricing trends",
      foodVaultAngle:
        "Position FoodVault membership as a practical buffer: exclusive independent-brand pricing that offsets supermarket inflation without waiting for weekly specials.",
      openaiInstruction:
        "Write a Discover news post framed around recent New Zealand grocery inflation and the supermarket duopoly (Foodstuffs / Woolworths). Use current public context if you are confident it is accurate; do not invent specific CPI figures. Explain how FoodVault's member pricing on independent Kiwi brands acts as a buffer against supermarket price rises. Keep the tone practical and local, not political.",
      membershipPriceMonthly: membership.membershipPriceMonthly,
      recentPartners,
    },
  };
}

export function featuredPartnerFromPayload(
  payload: BlogGenerationPayload
): PartnerBlogContext | null {
  if (payload.category === "partners") return payload.context;
  if (payload.category === "savings" || payload.category === "recipes") {
    return payload.context.partner;
  }
  return null;
}

export function logBlogGenerationPayload(payload: BlogGenerationPayload) {
  console.info("[generate-blog] selected category", {
    category: payload.category,
    cmsCategory: payload.cmsCategory,
    selectionReason: payload.selectionReason,
  });
  console.info("[generate-blog] gemini payload context", payload.context);
}
