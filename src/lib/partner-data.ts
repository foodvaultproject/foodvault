import { createClient } from "@/lib/supabase/client";
import { getAuthSession, isSupabaseConfigured } from "@/lib/auth";
import type {
  PartnerApplicationDraft,
  PartnerApplicationAssets,
} from "@/lib/partner-auth";
import type { ApplicationStatusV2, ListingStatusV2 } from "@/lib/partner-status";
import {
  parseLogoCrop,
  type LogoCropSettings,
} from "@/lib/partner-logo-crop";
import {
  parseGalleryImageCrops,
  type GalleryCropSettings,
} from "@/lib/partner-gallery-crop";
import {
  parseBannerCrop,
  type BannerCropSettings,
} from "@/lib/partner-banner-crop";
import {
  formatBusinessName,
  formatBusinessNameOrNull,
} from "@/lib/business-name";
import { normalizeSocialValueForStorage } from "@/lib/partner-social";
import {
  categoryGroupsFromLegacy,
  flattenDietaryLifestyleAttributes,
  hydrateCategoryGroupAttributes,
  normalizeCategoryGroups,
  normalizeDietaryLifestyleAttributes,
  parseDietaryLifestyleAttributes,
  resolveCategoryGroupsFromRecord,
  syncLegacyCategoryFields,
  type PartnerCategoryGroup,
} from "@/data/partner-categories";
import {
  getVaultDropStartedProducts,
  parseVaultDropStored,
  prepareVaultDropDraftForSubmit,
  validateVaultDropForm,
  type VaultDropFormDraft,
  type VaultDropProductStored,
  type VaultDropStored,
} from "@/lib/vault-drop";
import {
  buildStorewideDiscountTitle,
  draftToStoredProduct,
  memberCodeDiscountFromOffer,
  normalizeOfferExclusionsForStorage,
  offerAppliesToLabel,
  offerScopeFromLegacyAppliesTo,
  parseOfferScope,
  parseSelectedProducts,
  type OfferScope,
  type SelectedProduct,
  type SelectedProductDraft,
} from "@/lib/partner-offer";
import {
  affiliateProgramFromRecord,
  buildAffiliateStoragePayload,
  DEFAULT_AFFILIATE_COOKIE_DURATION,
  type AffiliateCookieDurationDays,
  type AffiliateProgramConfig,
} from "@/lib/partner-affiliate";

export type PartnerRecord = {
  id: string;
  user_id: string;
  application_status_v2: ApplicationStatusV2;
  listing_status_v2: ListingStatusV2;
  member_code: string | null;
  vault_drop_code: string | null;
  business_name: string | null;
  website_url: string | null;
  affiliate_enabled: boolean;
};

const DEV_PARTNER_PREFIX = "foodvault-partner-record";

function getDevPartnerKey(userId: string) {
  return `${DEV_PARTNER_PREFIX}:${userId}`;
}

function readDevPartner(userId: string): PartnerRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getDevPartnerKey(userId));
    return raw ? (JSON.parse(raw) as PartnerRecord) : null;
  } catch {
    return null;
  }
}

function writeDevPartner(record: PartnerRecord) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getDevPartnerKey(record.user_id), JSON.stringify(record));
}

function slugify(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

export function generateMemberCode(businessName: string, discountValue?: string) {
  const slug = slugify(businessName || "PARTNER");
  const discount = discountValue?.replace(/\D/g, "") || "10";
  return `FV-${slug}-${discount}`;
}

export function generateVaultDropCode(businessName: string, discountPercent: number | string) {
  const slug = slugify(businessName || "PARTNER");
  const discount = String(discountPercent).replace(/\D/g, "") || "30";
  return `FV-${slug}-FS-${discount}`;
}

function mapRow(row: Record<string, unknown>): PartnerRecord {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    application_status_v2: row.application_status_v2 as ApplicationStatusV2,
    listing_status_v2: row.listing_status_v2 as ListingStatusV2,
    member_code: (row.member_code as string | null) ?? null,
    vault_drop_code: (row.vault_drop_code as string | null) ?? null,
    business_name: formatBusinessNameOrNull(row.business_name as string | null),
    website_url: (row.website_url as string | null) ?? null,
    affiliate_enabled: Boolean(row.affiliate_enabled),
  };
}

// member_code column SELECT is revoked for anon/authenticated at the DB layer.
// Owners read their own code through the secure get_partner_discount_code RPC.
async function fetchOwnMemberCode(
  supabase: ReturnType<typeof createClient>,
  partnerId: string
): Promise<string | null> {
  const { data } = await supabase.rpc("get_partner_discount_code", {
    p_partner_id: partnerId,
  });
  return (data as string | null) ?? null;
}

async function fetchOwnVaultDropCode(
  supabase: ReturnType<typeof createClient>,
  partnerId: string
): Promise<string | null> {
  const { data } = await supabase.rpc("get_partner_vault_drop_code", {
    p_partner_id: partnerId,
  });
  return (data as string | null) ?? null;
}

/** Ensure partners with FLASH SALE products always have a persisted vault_drop_code. */
export async function resolvePartnerVaultDropCode(
  supabase: ReturnType<typeof createClient>,
  partnerId: string,
  businessName: string | null
): Promise<string | null> {
  const existing = await fetchOwnVaultDropCode(supabase, partnerId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("partners")
    .select("vault_drop")
    .eq("id", partnerId)
    .maybeSingle();

  if (error || !data) return null;

  const stored = parseVaultDropStored(
    (data as Record<string, unknown>).vault_drop
  );
  if (!stored?.products.length) return null;

  const code = generateVaultDropCode(
    businessName ?? "Partner",
    stored.discount_percentage
  );

  const { error: updateError } = await supabase
    .from("partners")
    .update({ vault_drop_code: code })
    .eq("id", partnerId);

  if (updateError) {
    console.error("[partner] vault_drop_code backfill failed:", updateError.message);
    // Still return the generated code so owners can copy it from the banner.
    return code;
  }

  return code;
}

const PARTNER_RECORD_COLUMNS =
  "id, user_id, application_status_v2, listing_status_v2, business_name, website_url, affiliate_enabled";

export async function getPartnerRecord(userId: string): Promise<PartnerRecord | null> {
  if (!isSupabaseConfigured()) {
    return readDevPartner(userId);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("partners")
    .select(PARTNER_RECORD_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const record = mapRow(data);
  record.member_code = await fetchOwnMemberCode(supabase, record.id);
  record.vault_drop_code = await resolvePartnerVaultDropCode(
    supabase,
    record.id,
    record.business_name
  );
  return record;
}

/** True when the auth user is a partner (metadata) or has a partners row. */
export async function isPartnerAccount(userId: string): Promise<boolean> {
  const session = await getAuthSession();
  if (session?.id === userId && session.roles.includes("partner")) {
    return true;
  }

  const record = await getPartnerRecord(userId);
  return record !== null;
}

export async function uploadVaultDropDraft(
  userId: string,
  draft: VaultDropFormDraft
): Promise<VaultDropStored | null> {
  const validation = validateVaultDropForm(draft, {
    requireComplete: draft.enabled,
  });
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  if (!validation.stored) {
    return null;
  }

  const products: VaultDropProductStored[] = [];
  const startedProducts = getVaultDropStartedProducts(draft);

  for (let index = 0; index < validation.stored.products.length; index += 1) {
    const productDraft = startedProducts[index];
    const storedProduct = validation.stored.products[index];
    if (!productDraft || !storedProduct) continue;

    const imageUrls = await uploadVaultDropProductImages(userId, productDraft.images);
    if (imageUrls.length === 0) {
      throw new Error(`FLASH SALE product ${index + 1} is missing a required photo.`);
    }

    products.push({
      ...storedProduct,
      image_urls: imageUrls,
    });
  }

  if (products.length === 0) {
    return null;
  }

  return {
    duration_days: validation.stored.duration_days,
    countdown_end_time: validation.stored.countdown_end_time,
    discount_percentage: validation.stored.discount_percentage,
    products,
  };
}

async function uploadVaultDropProductImages(
  userId: string,
  images: import("@/components/partners/PartnerGalleryUploadGrid").PartnerGalleryDraftItem[]
): Promise<string[]> {
  const urls: string[] = [];

  for (const item of images) {
    if (!item) continue;

    if (
      item.previewUrl.startsWith("http://") ||
      item.previewUrl.startsWith("https://")
    ) {
      urls.push(item.previewUrl);
      continue;
    }

    if (item.croppedFile && item.croppedFile.size > 0) {
      urls.push(await uploadPartnerAsset(userId, item.croppedFile, "vault-drop"));
    }
  }

  return urls;
}

async function resolveVaultDropForSubmit(
  userId: string,
  draft: VaultDropFormDraft | undefined
): Promise<VaultDropStored | null> {
  const prepared = prepareVaultDropDraftForSubmit(draft);
  if (!prepared.enabled) {
    return null;
  }

  return uploadVaultDropDraft(userId, prepared);
}

export async function submitPartnerApplication(
  userId: string,
  draft: PartnerApplicationDraft,
  assets?: PartnerApplicationAssets
): Promise<PartnerRecord> {
  const businessName = formatBusinessNameOrNull(draft.businessName);
  const offerScope = draft.offerScope ?? "entire_store";
  const selectedProductDrafts = draft.selectedProducts ?? [];
  const storedProducts = await uploadSelectedProductDrafts(
    userId,
    selectedProductDrafts,
    draft.discountValue ?? ""
  );
  const memberCode = generateMemberCode(
    businessName ?? "Partner",
    memberCodeDiscountFromOffer(
      offerScope,
      draft.discountValue ?? "",
      selectedProductDrafts
    )
  );
  const discountPercent =
    offerScope === "entire_store" && draft.discountValue
      ? Number(draft.discountValue.replace(/\D/g, ""))
      : null;

  const categoryFields = syncLegacyCategoryFields(
    normalizeCategoryGroups(
      draft.categoryGroups ??
        categoryGroupsFromLegacy(
          draft.primaryDepartment ?? "",
          draft.subcategories ?? []
        )
    )
  );

  const affiliateConfig: AffiliateProgramConfig = {
    enabled: draft.affiliateEnabled ?? false,
    commissionPercent: draft.affiliateCommissionPercent ?? "",
    cookieDurationDays:
      draft.affiliateCookieDurationDays ?? DEFAULT_AFFILIATE_COOKIE_DURATION,
    programDescription: draft.affiliateProgramDescription ?? "",
    affiliateTerms: draft.affiliateTerms ?? "",
  };
  const affiliatePayload = buildAffiliateStoragePayload(affiliateConfig, null);
  const affiliateCommission =
    affiliateConfig.enabled
      ? Number(affiliateConfig.commissionPercent.replace(/\D/g, ""))
      : null;
  const offerExclusions = normalizeOfferExclusionsForStorage(draft.offerExclusions);

  const payload = {
    user_id: userId,
    application_status_v2: "APPLICATION_UNDER_REVIEW" as const,
    listing_status_v2: "PENDING" as const,
    member_code: memberCode,
    business_name: businessName,
    website_url: draft.websiteUrl ?? null,
    short_description: draft.shortDescription ?? null,
    brand_story: draft.brandStory ?? null,
    primary_category: categoryFields.primary_category,
    subcategories: categoryFields.subcategories,
    offer_type: draft.offerType ?? null,
    discount_value:
      offerScope === "entire_store" ? draft.discountValue ?? null : null,
    offer_applies_to: offerAppliesToLabel(offerScope),
    offer_terms: null,
    offer_exclusions: offerExclusions,
    support_email: draft.supportEmail ?? null,
    support_phone: draft.supportPhone ?? null,
    contact_name: formatBusinessNameOrNull(draft.contactName),
    instagram: normalizeSocialValueForStorage(draft.instagram),
    facebook: normalizeSocialValueForStorage(draft.facebook),
    linkedin: normalizeSocialValueForStorage(draft.linkedin),
    tiktok: normalizeSocialValueForStorage(draft.tiktok),
    youtube: normalizeSocialValueForStorage(draft.youtube),
    location: "New Zealand",
  };

  if (!isSupabaseConfigured()) {
    const existing = readDevPartner(userId);
    const record: PartnerRecord = {
      id: existing?.id ?? `dev-partner-${userId}`,
      ...payload,
      affiliate_enabled: affiliateConfig.enabled,
      vault_drop_code: existing?.vault_drop_code ?? null,
    };
    writeDevPartner(record);
    return record;
  }

  const supabase = createClient();

  let bannerImageUrl: string | null = null;
  let bannerOriginalUrl: string | null = null;
  let bannerCrop: BannerCropSettings | null = null;
  let logoImageUrl: string | null = null;
  let galleryImageUrls: string[] = [];

  if (assets?.bannerUpload) {
    const uploaded = await uploadPartnerBanner(userId, assets.bannerUpload);
    bannerImageUrl = uploaded.bannerUrl;
    bannerOriginalUrl = uploaded.bannerOriginalUrl;
    bannerCrop = uploaded.bannerCrop;
  } else if (assets?.bannerFile) {
    bannerImageUrl = await uploadPartnerAsset(userId, assets.bannerFile, "banner");
  }
  if (assets?.logoFile) {
    logoImageUrl = await uploadPartnerAsset(userId, assets.logoFile, "logo");
  }
  let logoOriginalUrl: string | null = null;
  if (assets?.logoOriginalFile) {
    logoOriginalUrl = await uploadPartnerAsset(
      userId,
      assets.logoOriginalFile,
      "logo-original"
    );
  } else if (logoImageUrl) {
    logoOriginalUrl = logoImageUrl;
  }
  let galleryOriginalUrls: string[] = [];
  let galleryImageCrops: GalleryCropSettings[] = [];

  if (assets?.galleryItems?.length) {
    const uploaded = await Promise.all(
      assets.galleryItems.map((item) => uploadPartnerGalleryItem(userId, item))
    );
    galleryImageUrls = uploaded.map((row) => row.displayUrl);
    galleryOriginalUrls = uploaded.map((row) => row.originalUrl);
    galleryImageCrops = uploaded.map((row) => row.crop);
  } else if (assets?.galleryFiles?.length) {
    galleryImageUrls = await Promise.all(
      assets.galleryFiles.map((file) => uploadPartnerAsset(userId, file, "gallery"))
    );
  }

  const rpcBaseArgs = {
    p_business_name: businessName,
    p_website_url: draft.websiteUrl ?? null,
    p_short_description: draft.shortDescription ?? null,
    p_brand_story: draft.brandStory ?? null,
    p_primary_category: categoryFields.primary_category,
    p_subcategories: categoryFields.subcategories,
    p_offer_type: draft.offerType ?? null,
    p_discount_value:
      offerScope === "entire_store" ? draft.discountValue ?? null : null,
    p_offer_applies_to: offerAppliesToLabel(offerScope),
    p_offer_terms: null,
    p_offer_exclusions: offerExclusions,
    p_support_email: draft.supportEmail ?? null,
    p_support_phone: draft.supportPhone ?? null,
    p_instagram: normalizeSocialValueForStorage(draft.instagram),
    p_facebook: normalizeSocialValueForStorage(draft.facebook),
    p_linkedin: normalizeSocialValueForStorage(draft.linkedin),
    p_tiktok: normalizeSocialValueForStorage(draft.tiktok),
    p_member_code: memberCode,
    p_banner_image_url: bannerImageUrl,
    p_logo_url: logoImageUrl,
    p_gallery_image_urls: galleryImageUrls,
  };

  let data: unknown = null;
  let error: { message: string } | null = null;

  const extendedResult = await supabase.rpc("submit_partner_application", {
    ...rpcBaseArgs,
    p_logo_original_url: logoOriginalUrl,
    p_logo_crop: assets?.logoCrop ?? null,
    p_gallery_original_urls: galleryOriginalUrls,
    p_gallery_image_crops: galleryImageCrops,
    p_banner_original_url: bannerOriginalUrl,
    p_banner_crop: bannerCrop,
    p_offer_scope: offerScope,
    p_selected_products: storedProducts,
    p_discount_percent: discountPercent,
    p_affiliate_enabled: affiliateConfig.enabled,
    p_affiliate_commission_percent: affiliateCommission,
    p_affiliate_cookie_duration_days: affiliateConfig.enabled
      ? affiliateConfig.cookieDurationDays
      : null,
    p_affiliate_program_description: affiliateConfig.programDescription.trim() || null,
    p_affiliate_terms: affiliateConfig.affiliateTerms.trim() || null,
  });
  data = extendedResult.data;
  error = extendedResult.error;

  if (
    error &&
    (error.message.includes("Could not find the function") ||
      error.message.includes("schema cache"))
  ) {
    const legacyResult = await supabase.rpc(
      "submit_partner_application",
      rpcBaseArgs
    );
    data = legacyResult.data;
    error = legacyResult.error;

    if (
      !error &&
      data &&
      (logoOriginalUrl ||
        assets?.logoCrop ||
        bannerOriginalUrl ||
        bannerCrop ||
        galleryOriginalUrls.length > 0 ||
        galleryImageCrops.length > 0)
    ) {
      const partnerId = (data as Record<string, unknown>).id;
      if (typeof partnerId === "string") {
        await supabase
          .from("partners")
          .update({
            logo_original_url: logoOriginalUrl,
            logo_crop: assets?.logoCrop ?? null,
            banner_original_url: bannerOriginalUrl,
            banner_crop: bannerCrop,
            gallery_original_urls: galleryOriginalUrls,
            gallery_image_crops: galleryImageCrops,
            offer_scope: offerScope,
            selected_products: storedProducts,
            discount_percent: discountPercent,
            category_groups: categoryFields.category_groups,
            primary_categories: categoryFields.primary_categories,
            dietary_lifestyle_attributes:
              categoryFields.dietary_lifestyle_attributes,
            offer_exclusions: offerExclusions,
            youtube: normalizeSocialValueForStorage(draft.youtube),
            ...affiliatePayload,
          })
          .eq("user_id", userId);
      }
    }
  }

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to submit partner application.");
  }

  const vaultDropStored = await resolveVaultDropForSubmit(userId, draft.vaultDrop);
  const vaultDropCode = vaultDropStored
    ? generateVaultDropCode(businessName ?? "Partner", vaultDropStored.discount_percentage)
    : null;

  const { error: postSubmitError } = await supabase
    .from("partners")
    .update({
      category_groups: categoryFields.category_groups,
      primary_categories: categoryFields.primary_categories,
      dietary_lifestyle_attributes: categoryFields.dietary_lifestyle_attributes,
      offer_exclusions: offerExclusions,
      youtube: normalizeSocialValueForStorage(draft.youtube),
      contact_name: formatBusinessNameOrNull(draft.contactName),
      vault_drop: vaultDropStored,
      ...(vaultDropCode ? { vault_drop_code: vaultDropCode } : {}),
      ...affiliatePayload,
    })
    .eq("user_id", userId);

  if (postSubmitError) {
    throw new Error(
      postSubmitError.message.includes("vault_drop")
        ? "Your application was submitted, but FLASH SALE details could not be saved. Please add them again on My Listing."
        : `Unable to save application details: ${postSubmitError.message}`
    );
  }

  const record = mapRow(data as Record<string, unknown>);
  record.member_code = memberCode;
  record.vault_drop_code = vaultDropCode;
  return record;
}

export async function confirmMemberOfferLive(
  userId: string,
  partnerId: string
): Promise<PartnerRecord> {
  if (!isSupabaseConfigured()) {
    const existing = readDevPartner(userId);
    if (!existing) {
      throw new Error("Partner record not found.");
    }

    const record: PartnerRecord = {
      ...existing,
      listing_status_v2: "LIVE",
    };
    writeDevPartner(record);
    return record;
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("confirm_partner_offer_live", {
    p_partner_id: partnerId,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to confirm member offer.");
  }

  const record = mapRow(data as Record<string, unknown>);
  record.member_code = await fetchOwnMemberCode(supabase, record.id);
  record.vault_drop_code = await resolvePartnerVaultDropCode(
    supabase,
    record.id,
    record.business_name
  );
  return record;
}

// ---------------------------------------------------------------------------
// Full listing load/save + image uploads (partner listing editor)
// ---------------------------------------------------------------------------

export type PartnerListingData = {
  companyName: string;
  websiteUrl: string;
  shortDescription: string;
  brandStory: string;
  primaryDepartment: string;
  subcategories: string[];
  categoryGroups: PartnerCategoryGroup[];
  dietaryLifestyleAttributes: string[];
  offerType: string;
  offerValue: string;
  offerTitle: string;
  offerScope: OfferScope;
  selectedProducts: SelectedProduct[];
  offerExclusions: string;
  supportEmail: string;
  supportPhone: string;
  contactName: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
  bannerImageUrl: string | null;
  bannerOriginalUrl: string | null;
  bannerCrop: BannerCropSettings | null;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: LogoCropSettings | null;
  galleryImageUrls: string[];
  galleryOriginalUrls: string[];
  galleryImageCrops: GalleryCropSettings[];
  slug: string;
  affiliateEnabled: boolean;
  affiliateCommissionPercent: string;
  affiliateCookieDurationDays: AffiliateCookieDurationDays;
  affiliateProgramDescription: string;
  affiliateTerms: string;
  affiliateCreatedAt: string | null;
  affiliateUpdatedAt: string | null;
  vaultDrop: import("@/lib/vault-drop").VaultDropStored | null;
};

const LISTING_COLUMNS_CORE =
  "business_name, website_url, short_description, brand_story, primary_category, subcategories, offer_type, discount_value, discount_percent, offer_applies_to, support_email, support_phone, instagram, facebook, tiktok, banner_image_url, logo_url, gallery_image_urls, slug";

const LISTING_COLUMNS_CORE_WITH_CONTACT = `${LISTING_COLUMNS_CORE}, contact_name`;

const LISTING_COLUMNS_SOCIAL =
  `${LISTING_COLUMNS_CORE}, linkedin, youtube`;

const LISTING_COLUMNS_MULTI_CATEGORY =
  `${LISTING_COLUMNS_SOCIAL}, primary_categories, category_groups`;

const LISTING_COLUMNS_BASE =
  `${LISTING_COLUMNS_MULTI_CATEGORY}, offer_scope, selected_products, offer_exclusions`;

const LISTING_COLUMNS_WITH_LOGO =
  `${LISTING_COLUMNS_BASE}, logo_original_url, logo_crop`;

const LISTING_COLUMNS_AFFILIATE =
  `${LISTING_COLUMNS_WITH_LOGO}, banner_original_url, banner_crop, gallery_original_urls, gallery_image_crops, affiliate_enabled, affiliate_commission_percent, affiliate_cookie_duration_days, affiliate_program_description, affiliate_terms, affiliate_created_at, affiliate_updated_at`;

const LISTING_COLUMNS_AFFILIATE_WITH_CONTACT =
  `${LISTING_COLUMNS_AFFILIATE}, contact_name`;

const LISTING_COLUMNS_DIETARY =
  `${LISTING_COLUMNS_AFFILIATE}, dietary_lifestyle_attributes`;

const LISTING_COLUMNS_DIETARY_WITH_CONTACT =
  `${LISTING_COLUMNS_DIETARY}, contact_name`;

const LISTING_COLUMNS_VAULT_DROP =
  `${LISTING_COLUMNS_DIETARY_WITH_CONTACT}, vault_drop`;

const LISTING_COLUMNS = LISTING_COLUMNS_VAULT_DROP;

const LISTING_COLUMN_TIERS = [
  LISTING_COLUMNS_VAULT_DROP,
  LISTING_COLUMNS_DIETARY_WITH_CONTACT,
  LISTING_COLUMNS_DIETARY,
  LISTING_COLUMNS_AFFILIATE_WITH_CONTACT,
  LISTING_COLUMNS_AFFILIATE,
  LISTING_COLUMNS_WITH_LOGO,
  LISTING_COLUMNS_BASE,
  LISTING_COLUMNS_MULTI_CATEGORY,
  LISTING_COLUMNS_SOCIAL,
  LISTING_COLUMNS_CORE_WITH_CONTACT,
  LISTING_COLUMNS_CORE,
] as const;

const LISTING_FALLBACK_COLUMNS =
  "business_name, website_url, short_description, brand_story, primary_category, primary_categories, category_groups, subcategories, dietary_lifestyle_attributes, offer_type, discount_value, discount_percent, offer_applies_to, offer_scope, selected_products, support_email, support_phone, instagram, facebook, linkedin, tiktok, youtube, banner_image_url, logo_url, gallery_image_urls, slug, affiliate_enabled, affiliate_commission_percent, affiliate_cookie_duration_days, affiliate_program_description, affiliate_terms, affiliate_created_at, affiliate_updated_at, logo_original_url, logo_crop, banner_original_url, banner_crop, gallery_original_urls, gallery_image_crops";

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

const LISTING_MEDIA_COLUMN_TIERS = [
  "banner_image_url, logo_url, banner_original_url, banner_crop, logo_original_url, logo_crop, gallery_image_urls, gallery_original_urls, gallery_image_crops",
  "banner_image_url, logo_url, banner_original_url, logo_original_url, logo_crop, banner_crop",
  "banner_image_url, logo_url",
] as const;

async function fetchPartnerListingMediaRow(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Record<string, unknown>> {
  for (const columns of LISTING_MEDIA_COLUMN_TIERS) {
    const { data, error } = await supabase
      .from("partners")
      .select(columns)
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      return data as unknown as Record<string, unknown>;
    }

    if (error && !isPartnerListingColumnError(error.message)) {
      break;
    }
  }

  return {};
}

function mergePartnerListingRows(
  base: Record<string, unknown>,
  media: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...base };

  for (const [key, value] of Object.entries(media)) {
    if (value !== null && value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

function mapPartnerListingRow(row: Record<string, unknown>): PartnerListingData {
  const discountPercent = row.discount_percent as number | null;
  const affiliate = affiliateProgramFromRecord(row);
  const categoryGroups = hydrateCategoryGroupAttributes(
    resolveCategoryGroupsFromRecord(row),
    parseDietaryLifestyleAttributes(row.dietary_lifestyle_attributes)
  );

  return {
    companyName: formatBusinessName(str(row.business_name)),
    websiteUrl: str(row.website_url),
    shortDescription: str(row.short_description),
    brandStory: str(row.brand_story),
    primaryDepartment: str(row.primary_category),
    subcategories: Array.isArray(row.subcategories)
      ? (row.subcategories as string[])
      : [],
    categoryGroups,
    dietaryLifestyleAttributes: flattenDietaryLifestyleAttributes(categoryGroups),
    offerType: str(row.offer_type) || "Percentage Discount",
    offerValue:
      discountPercent != null
        ? String(discountPercent)
        : str(row.discount_value).replace(/[^0-9.]/g, ""),
    offerTitle: str(row.discount_value),
    offerScope:
      parseOfferScope(row.offer_scope) ??
      offerScopeFromLegacyAppliesTo(str(row.offer_applies_to)),
    selectedProducts: parseSelectedProducts(row.selected_products),
    offerExclusions: str(row.offer_exclusions),
    supportEmail: str(row.support_email),
    supportPhone: str(row.support_phone),
    contactName: formatBusinessName(str(row.contact_name)),
    instagram: str(row.instagram),
    facebook: str(row.facebook),
    linkedin: str(row.linkedin),
    tiktok: str(row.tiktok),
    youtube: str(row.youtube),
    bannerImageUrl:
      (row.banner_image_url as string | null) ??
      (row.banner_original_url as string | null) ??
      null,
    bannerOriginalUrl: (row.banner_original_url as string | null) ?? null,
    bannerCrop: parseBannerCrop(row.banner_crop),
    logoUrl:
      (row.logo_url as string | null) ??
      (row.logo_original_url as string | null) ??
      null,
    logoOriginalUrl: (row.logo_original_url as string | null) ?? null,
    logoCrop: parseLogoCrop(row.logo_crop),
    galleryImageUrls: Array.isArray(row.gallery_image_urls)
      ? (row.gallery_image_urls as string[])
      : [],
    galleryOriginalUrls: Array.isArray(row.gallery_original_urls)
      ? (row.gallery_original_urls as string[])
      : [],
    galleryImageCrops: parseGalleryImageCrops(row.gallery_image_crops),
    slug: str(row.slug),
    affiliateEnabled: affiliate.enabled,
    affiliateCommissionPercent: affiliate.commissionPercent,
    affiliateCookieDurationDays: affiliate.cookieDurationDays,
    affiliateProgramDescription: affiliate.programDescription,
    affiliateTerms: affiliate.affiliateTerms,
    affiliateCreatedAt:
      typeof row.affiliate_created_at === "string" ? row.affiliate_created_at : null,
    affiliateUpdatedAt:
      typeof row.affiliate_updated_at === "string" ? row.affiliate_updated_at : null,
    vaultDrop: parseVaultDropStored(row.vault_drop),
  };
}

export async function getPartnerListing(
  userId: string
): Promise<PartnerListingData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createClient();
  let baseRow: Record<string, unknown> | null = null;

  for (const columns of LISTING_COLUMN_TIERS) {
    const { data, error } = await supabase
      .from("partners")
      .select(columns)
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      baseRow = data as unknown as Record<string, unknown>;
      break;
    }

    if (error && !isPartnerListingColumnError(error.message)) {
      break;
    }
  }

  if (!baseRow) {
    const { data, error } = await supabase
      .from("partners")
      .select(LISTING_FALLBACK_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      baseRow = data as unknown as Record<string, unknown>;
    }
  }

  if (!baseRow) {
    return null;
  }

  const mediaRow = await fetchPartnerListingMediaRow(supabase, userId);
  const listing = mapPartnerListingRow(mergePartnerListingRows(baseRow, mediaRow));

  if (!listing.contactName) {
    const { data, error } = await supabase
      .from("partners")
      .select("contact_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      listing.contactName = formatBusinessName(
        str((data as Record<string, unknown>).contact_name)
      );
    }
  }

  if (listing.vaultDrop == null) {
    const { data, error } = await supabase
      .from("partners")
      .select("vault_drop")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[partner-listing] vault_drop fetch failed:", error.message);
    } else if (data) {
      listing.vaultDrop = parseVaultDropStored(
        (data as Record<string, unknown>).vault_drop
      );
    }
  }

  return listing;
}

function isPartnerListingColumnError(message: string | undefined): boolean {
  if (!message) return false;

  return (
    message.includes("Could not find the") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("permission denied")
  );
}

function isMissingPartnerColumnError(message: string): boolean {
  return isPartnerListingColumnError(message);
}

function buildPartnerListingUpdatePayload(
  data: PartnerListingData,
  options: { logoCrop?: boolean; bannerCrop?: boolean; galleryCrop?: boolean } = {}
) {
  const categoryFields = syncLegacyCategoryFields(
    normalizeCategoryGroups(data.categoryGroups)
  );

  const payload: Record<string, unknown> = {
    business_name: formatBusinessNameOrNull(data.companyName),
    website_url: data.websiteUrl || null,
    short_description: data.shortDescription || null,
    brand_story: data.brandStory || null,
    primary_category: categoryFields.primary_category,
    primary_categories: categoryFields.primary_categories,
    category_groups: categoryFields.category_groups,
    subcategories: categoryFields.subcategories,
    dietary_lifestyle_attributes:
      categoryFields.dietary_lifestyle_attributes ??
      normalizeDietaryLifestyleAttributes(data.dietaryLifestyleAttributes),
    offer_type: data.offerType || null,
    offer_applies_to: offerAppliesToLabel(data.offerScope),
    offer_scope: data.offerScope,
    selected_products: data.selectedProducts ?? [],
    offer_exclusions: normalizeOfferExclusionsForStorage(data.offerExclusions),
    offer_terms: null,
    support_email: data.supportEmail || null,
    support_phone: data.supportPhone || null,
    contact_name: formatBusinessNameOrNull(data.contactName),
    instagram: normalizeSocialValueForStorage(data.instagram),
    facebook: normalizeSocialValueForStorage(data.facebook),
    linkedin: normalizeSocialValueForStorage(data.linkedin),
    tiktok: normalizeSocialValueForStorage(data.tiktok),
    youtube: normalizeSocialValueForStorage(data.youtube),
    banner_image_url: data.bannerImageUrl,
    logo_url: data.logoUrl,
    gallery_image_urls: data.galleryImageUrls ?? [],
    updated_at: new Date().toISOString(),
  };

  if (data.offerScope === "entire_store") {
    payload.discount_value = data.offerValue
      ? buildStorewideDiscountTitle(data.offerValue)
      : data.offerTitle || null;
    payload.discount_percent = data.offerValue
      ? Number(data.offerValue.replace(/[^0-9.]/g, ""))
      : null;
  } else {
    payload.discount_value = null;
    payload.discount_percent = null;
  }

  if (options.logoCrop) {
    payload.logo_original_url = data.logoOriginalUrl;
    payload.logo_crop = data.logoCrop;
  }

  if (options.bannerCrop) {
    payload.banner_original_url = data.bannerOriginalUrl;
    payload.banner_crop = data.bannerCrop;
  }

  if (options.galleryCrop) {
    payload.gallery_original_urls = data.galleryOriginalUrls ?? [];
    payload.gallery_image_crops = data.galleryImageCrops ?? [];
  }

  Object.assign(
    payload,
    buildAffiliateStoragePayload(
      {
        enabled: data.affiliateEnabled,
        commissionPercent: data.affiliateCommissionPercent,
        cookieDurationDays: data.affiliateCookieDurationDays,
        programDescription: data.affiliateProgramDescription,
        affiliateTerms: data.affiliateTerms,
      },
      data.affiliateCreatedAt
    )
  );

  payload.vault_drop = data.vaultDrop;

  return payload;
}

export async function updatePartnerListing(
  userId: string,
  data: PartnerListingData
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createClient();
  const fullPayload = buildPartnerListingUpdatePayload(data, {
    logoCrop: true,
    bannerCrop: true,
    galleryCrop: true,
  });

  const { data: partnerRow } = await supabase
    .from("partners")
    .select("id, business_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (partnerRow && data.vaultDrop?.products.length) {
    const existingVaultDropCode = await fetchOwnVaultDropCode(
      supabase,
      String(partnerRow.id)
    );
    if (!existingVaultDropCode) {
      fullPayload.vault_drop_code = generateVaultDropCode(
        formatBusinessNameOrNull(partnerRow.business_name as string | null) ??
          data.companyName,
        data.vaultDrop.discount_percentage
      );
    }
  } else if (partnerRow && !data.vaultDrop) {
    fullPayload.vault_drop_code = null;
  }

  let { error } = await supabase
    .from("partners")
    .update(fullPayload)
    .eq("user_id", userId);

  if (error && isMissingPartnerColumnError(error.message)) {
    const mediaPayload = buildPartnerListingUpdatePayload(data, {
      logoCrop: true,
      bannerCrop: true,
    });
    const mediaRetry = await supabase
      .from("partners")
      .update(mediaPayload)
      .eq("user_id", userId);
    error = mediaRetry.error;
  }

  if (error && isMissingPartnerColumnError(error.message)) {
    const logoPayload = buildPartnerListingUpdatePayload(data, { logoCrop: true });
    const logoRetry = await supabase
      .from("partners")
      .update(logoPayload)
      .eq("user_id", userId);
    error = logoRetry.error;
  }

  if (error && isMissingPartnerColumnError(error.message)) {
    const legacyPayload = buildPartnerListingUpdatePayload(data);
    const retry = await supabase
      .from("partners")
      .update(legacyPayload)
      .eq("user_id", userId);
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  if (partnerRow && data.vaultDrop?.products.length) {
    await resolvePartnerVaultDropCode(
      supabase,
      String(partnerRow.id),
      formatBusinessNameOrNull(partnerRow.business_name as string | null) ??
        data.companyName
    );
  }
}

export type PartnerAssetKind =
  | "logo"
  | "logo-original"
  | "banner"
  | "banner-original"
  | "gallery"
  | "gallery-original"
  | "offer-product"
  | "vault-drop";

export type PartnerBannerUploadPayload = {
  croppedFile: File;
  originalFile?: File | null;
  crop: BannerCropSettings;
  recropOnly?: boolean;
  existingOriginalUrl?: string | null;
};

export type PartnerGalleryUploadPayload = {
  croppedFile: File;
  originalFile?: File | null;
  crop: GalleryCropSettings;
  recropOnly?: boolean;
  existingOriginalUrl?: string | null;
};

export type PartnerLogoUploadPayload = {
  croppedFile: File;
  originalFile?: File | null;
  crop: LogoCropSettings;
  /** Preserved when re-cropping an existing logo without replacing the original file. */
  existingOriginalUrl?: string | null;
};

export async function uploadPartnerBanner(
  userId: string,
  payload: PartnerBannerUploadPayload
): Promise<{
  bannerUrl: string;
  bannerOriginalUrl: string;
  bannerCrop: BannerCropSettings;
}> {
  const bannerUrl = await uploadPartnerAsset(userId, payload.croppedFile, "banner");
  let bannerOriginalUrl = payload.existingOriginalUrl ?? null;

  if (payload.originalFile) {
    bannerOriginalUrl = await uploadPartnerAsset(
      userId,
      payload.originalFile,
      "banner-original"
    );
  } else if (!bannerOriginalUrl) {
    bannerOriginalUrl = bannerUrl;
  }

  return {
    bannerUrl,
    bannerOriginalUrl,
    bannerCrop: payload.crop,
  };
}

export async function uploadPartnerGalleryItem(
  userId: string,
  payload: PartnerGalleryUploadPayload
): Promise<{
  displayUrl: string;
  originalUrl: string;
  crop: GalleryCropSettings;
}> {
  const displayUrl = await uploadPartnerAsset(userId, payload.croppedFile, "gallery");
  let originalUrl = payload.existingOriginalUrl ?? null;

  if (payload.originalFile) {
    originalUrl = await uploadPartnerAsset(
      userId,
      payload.originalFile,
      "gallery-original"
    );
  } else if (!originalUrl) {
    originalUrl = displayUrl;
  }

  return {
    displayUrl,
    originalUrl,
    crop: payload.crop,
  };
}

export async function uploadPartnerLogo(
  userId: string,
  payload: PartnerLogoUploadPayload
): Promise<{
  logoUrl: string;
  logoOriginalUrl: string;
  logoCrop: LogoCropSettings;
}> {
  const logoUrl = await uploadPartnerAsset(userId, payload.croppedFile, "logo");
  let logoOriginalUrl = payload.existingOriginalUrl ?? null;

  if (payload.originalFile) {
    logoOriginalUrl = await uploadPartnerAsset(
      userId,
      payload.originalFile,
      "logo-original"
    );
  } else if (!logoOriginalUrl) {
    logoOriginalUrl = logoUrl;
  }

  return {
    logoUrl,
    logoOriginalUrl,
    logoCrop: payload.crop,
  };
}

export async function persistPartnerLogo(
  userId: string,
  logo: {
    logoUrl: string | null;
    logoOriginalUrl: string | null;
    logoCrop: LogoCropSettings | null;
  }
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createClient();
  const payload = {
    logo_url: logo.logoUrl,
    logo_original_url: logo.logoOriginalUrl,
    logo_crop: logo.logoCrop,
    updated_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("partners").update(payload).eq("user_id", userId);

  if (error && isMissingPartnerColumnError(error.message)) {
    const legacy = await supabase
      .from("partners")
      .update({
        logo_url: logo.logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    error = legacy.error;
  }

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadSelectedProductDrafts(
  userId: string,
  drafts: SelectedProductDraft[],
  sharedDiscountPercent = ""
): Promise<SelectedProduct[]> {
  const results: SelectedProduct[] = [];

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    let imageUrl = draft.imageUrl;

    if (draft.imageFile) {
      imageUrl = await uploadPartnerAsset(userId, draft.imageFile, "offer-product");
    }

    const stored = draftToStoredProduct(
      {
        ...draft,
        imageUrl: imageUrl ?? "",
      },
      sharedDiscountPercent
    );

    if (!stored || !imageUrl) {
      throw new Error(`Product ${index + 1} is missing a required image.`);
    }

    results.push({ ...stored, imageUrl, sortOrder: index });
  }

  return results;
}

export async function uploadPartnerAsset(
  userId: string,
  file: File,
  kind: PartnerAssetKind
): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(
      "File size exceeds the 10MB limit. Please upload a smaller image."
    );
  }

  if (!isSupabaseConfigured()) {
    // Dev mode: return a local preview URL (not persisted).
    return URL.createObjectURL(file);
  }

  const supabase = createClient();

  let uploadFile = file;
  if (typeof window !== "undefined") {
    const { compressImageForUpload } = await import("@/lib/image-compress");
    uploadFile = await compressImageForUpload(file);
  }

  const ext = (uploadFile.name.split(".").pop() || "webp").toLowerCase();
  const path = `${userId}/${kind}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("partner-assets")
    .upload(path, uploadFile, {
      upsert: true,
      cacheControl: "3600",
      contentType: uploadFile.type || "image/webp",
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("partner-assets").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateDevPartnerStatus(
  userId: string,
  applicationStatus: ApplicationStatusV2,
  listingStatus: ListingStatusV2 = "PENDING"
): Promise<PartnerRecord | null> {
  if (isSupabaseConfigured()) {
    return null;
  }

  const existing = readDevPartner(userId);
  if (!existing) {
    return null;
  }

  const record: PartnerRecord = {
    ...existing,
    application_status_v2: applicationStatus,
    listing_status_v2: listingStatus,
    member_code:
      existing.member_code ??
      generateMemberCode(existing.business_name ?? "Partner"),
  };
  writeDevPartner(record);
  return record;
}
