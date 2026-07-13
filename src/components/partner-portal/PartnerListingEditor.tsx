"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PartnerCategoriesEditor } from "@/components/partner/PartnerCategorySelector";
import {
  emptyCategoryGroup,
  validateCategoryGroups,
  type PartnerCategoryGroup,
} from "@/data/partner-categories";
import { MemberExclusiveOfferFields } from "@/components/partners/MemberExclusiveOfferFields";
import { AffiliateProgramFields } from "@/components/partners/AffiliateProgramFields";
import { PartnerSocialFields } from "@/components/partners/PartnerSocialFields";
import {
  SOCIAL_PRESENCE_SECTION_DESCRIPTION,
  SOCIAL_PRESENCE_SECTION_TITLE,
  hasSocialFieldErrors,
  patchSocialFieldError,
  type PartnerSocialLinks,
  type SocialFieldErrors,
  type SocialFieldKey,
  validatePartnerSocialLinks,
} from "@/lib/partner-social";
import {
  buildStorewideDiscountTitle,
  deriveSelectedProductsDiscount,
  sanitizeDiscountValue,
  selectedProductToDraft,
  validateOfferForm,
  type OfferScope,
  type SelectedProductDraft,
} from "@/lib/partner-offer";
import {
  AFFILIATE_PROGRAM_COMING_SOON,
  DEFAULT_AFFILIATE_COOKIE_DURATION,
  validateAffiliateProgram,
  type AffiliateCookieDurationDays,
} from "@/lib/partner-affiliate";
import {
  getPartnerListing,
  updatePartnerListing,
  uploadPartnerAsset,
  uploadPartnerBanner,
  uploadPartnerGalleryItem,
  uploadPartnerLogo,
  uploadSelectedProductDrafts,
  persistPartnerLogo,
  type PartnerAssetKind,
  type PartnerListingData,
  type PartnerRecord,
} from "@/lib/partner-data";
import {
  finalizeBusinessNameInput,
  formatBusinessNameInput,
  MAX_BUSINESS_NAME_LENGTH,
  MAX_CONTACT_NAME_LENGTH,
} from "@/lib/business-name";
import {
  partnerProfilePathFromSlug,
  partnerProfileSlug,
} from "@/lib/member/favorites-utils";
import type { LogoCropSettings } from "@/lib/partner-logo-crop";
import {
  PartnerLogoUploadField,
  type PartnerLogoUploadValue,
} from "@/components/partners/PartnerLogoUploadField";
import {
  PartnerBannerUploadField,
  type PartnerBannerUploadValue,
} from "@/components/partners/PartnerBannerUploadField";
import {
  PartnerGalleryUploadGrid,
  type PartnerGalleryItem,
  type PartnerGalleryUploadValue,
} from "@/components/partners/PartnerGalleryUploadGrid";
import { PartnerPortalShell } from "./PartnerPortalShell";
import { PartnerAffiliateSetupBanner } from "./PartnerAffiliateSetupBanner";
import { usePartnerOnboarding } from "./PartnerOnboardingProvider";
import {
  portalBtnOutline,
  portalBtnPrimary,
  portalCard,
  portalFieldGap,
  portalCardContent,
  portalMetricValue,
  portalFormGrid,
  portalHelper,
  portalInput,
  portalInputDisabled,
  portalLabel,
  portalPage,
  portalPageSubtitle,
  portalPageTitle,
  portalSectionStack,
  portalSectionTitle,
  portalTextarea,
} from "@/lib/partner-portal-classes";

const inputClass = portalInput;

type EditorListing = {
  companyName: string;
  websiteUrl: string;
  shortDescription: string;
  brandStory: string;
  categoryGroups: PartnerCategoryGroup[];
  offerType: string;
  offerValue: string;
  offerTitle: string;
  offerScope: OfferScope;
  selectedProductDrafts: SelectedProductDraft[];
  memberCode: string;
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
  bannerCrop: import("@/lib/partner-banner-crop").BannerCropSettings | null;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: LogoCropSettings | null;
  galleryItems: PartnerGalleryItem[];
  profileSlug: string;
  affiliateEnabled: boolean;
  affiliateCommissionPercent: string;
  affiliateCookieDurationDays: AffiliateCookieDurationDays;
  affiliateProgramDescription: string;
  affiliateTerms: string;
  affiliateCreatedAt: string | null;
};

const emptyListing: EditorListing = {
  companyName: "",
  websiteUrl: "",
  shortDescription: "",
  brandStory: "",
  categoryGroups: [emptyCategoryGroup()],
  offerType: "Percentage Discount",
  offerValue: "",
  offerTitle: "",
  offerScope: "entire_store",
  selectedProductDrafts: [],
  memberCode: "",
  supportEmail: "",
  supportPhone: "",
  contactName: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  tiktok: "",
  youtube: "",
  bannerImageUrl: null,
  bannerOriginalUrl: null,
  bannerCrop: null,
  logoUrl: null,
  logoOriginalUrl: null,
  logoCrop: null,
  galleryItems: [],
  profileSlug: "",
  affiliateEnabled: false,
  affiliateCommissionPercent: "",
  affiliateCookieDurationDays: DEFAULT_AFFILIATE_COOKIE_DURATION,
  affiliateProgramDescription: "",
  affiliateTerms: "",
  affiliateCreatedAt: null,
};

function galleryItemsFromData(data: PartnerListingData): PartnerGalleryItem[] {
  return (data.galleryImageUrls ?? []).map((displayUrl, index) => ({
    displayUrl,
    originalUrl: data.galleryOriginalUrls[index] ?? displayUrl,
    crop: data.galleryImageCrops[index] ?? null,
  }));
}

function listingFromPartnerRecord(partner: PartnerRecord): EditorListing {
  return {
    ...emptyListing,
    companyName: partner.business_name ?? "",
    websiteUrl: partner.website_url ?? "",
    memberCode: partner.member_code ?? "",
    profileSlug: partnerProfileSlug(partner.business_name ?? ""),
  };
}

function listingFromData(data: PartnerListingData, partner: PartnerRecord): EditorListing {
  const offerValue =
    data.offerScope === "entire_store"
      ? data.offerValue
      : data.offerValue || deriveSelectedProductsDiscount(data.selectedProducts);

  return {
    companyName: data.companyName || partner.business_name || "",
    websiteUrl: data.websiteUrl || partner.website_url || "",
    shortDescription: data.shortDescription,
    brandStory: data.brandStory,
    categoryGroups:
      data.categoryGroups.length > 0 ? data.categoryGroups : [emptyCategoryGroup()],
    offerType: data.offerType || "Percentage Discount",
    offerValue,
    offerTitle: data.offerTitle,
    offerScope: data.offerScope,
    selectedProductDrafts: data.selectedProducts.map(selectedProductToDraft),
    memberCode: partner.member_code ?? "",
    supportEmail: data.supportEmail,
    supportPhone: data.supportPhone,
    contactName: data.contactName,
    instagram: data.instagram,
    facebook: data.facebook,
    linkedin: data.linkedin,
    tiktok: data.tiktok,
    youtube: data.youtube,
    bannerImageUrl: data.bannerImageUrl,
    bannerOriginalUrl: data.bannerOriginalUrl,
    bannerCrop: data.bannerCrop,
    logoUrl: data.logoUrl,
    logoOriginalUrl: data.logoOriginalUrl,
    logoCrop: data.logoCrop,
    galleryItems: galleryItemsFromData(data),
    profileSlug:
      data.slug || partnerProfileSlug(data.companyName || partner.business_name || ""),
    affiliateEnabled: AFFILIATE_PROGRAM_COMING_SOON ? false : data.affiliateEnabled,
    affiliateCommissionPercent: data.affiliateCommissionPercent,
    affiliateCookieDurationDays: data.affiliateCookieDurationDays,
    affiliateProgramDescription: data.affiliateProgramDescription,
    affiliateTerms: data.affiliateTerms,
    affiliateCreatedAt: data.affiliateCreatedAt,
  };
}

export function PartnerListingEditor() {
  const { partner, loading, isListingEditable, onboardingState, refreshPartner } =
    usePartnerOnboarding();
  const [listing, setListing] = useState<EditorListing>(emptyListing);
  const [listingLoaded, setListingLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<PartnerAssetKind | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [socialErrors, setSocialErrors] = useState<SocialFieldErrors>({});
  const offerConfirmed = onboardingState === "LIVE";

  const socialValues: PartnerSocialLinks = {
    instagram: listing.instagram,
    facebook: listing.facebook,
    linkedin: listing.linkedin,
    tiktok: listing.tiktok,
    youtube: listing.youtube,
  };

  function handleSocialChange(field: SocialFieldKey, value: string) {
    if (!isListingEditable) return;
    setListing((prev) => ({ ...prev, [field]: value }));
    setSocialErrors((current) => patchSocialFieldError(current, field, value));
  }

  useEffect(() => {
    if (loading) return;

    if (!partner) {
      setListing(emptyListing);
      setListingLoaded(true);
      return;
    }

    let active = true;
    setListingLoaded(false);

    (async () => {
      const data = await getPartnerListing(partner.user_id);
      if (!active) return;

      setListing(
        data ? listingFromData(data, partner) : listingFromPartnerRecord(partner)
      );
      setListingLoaded(true);
    })();

    return () => {
      active = false;
    };
  }, [partner, loading]);

  const update = (field: keyof EditorListing, value: string) => {
    if (!isListingEditable) return;
    const nextValue =
      field === "companyName"
        ? formatBusinessNameInput(value, MAX_BUSINESS_NAME_LENGTH)
        : value;
    setListing((prev) => ({ ...prev, [field]: nextValue }) as EditorListing);
  };

  const finalizeCompanyName = () => {
    if (!isListingEditable) return;
    setListing(
      (prev) =>
        ({
          ...prev,
          companyName: finalizeBusinessNameInput(prev.companyName),
        }) as EditorListing
    );
  };

  const canEditOffer = onboardingState !== "APPLICATION_UNDER_REVIEW";

  function updateOfferValue(raw: string) {
    if (!canEditOffer) return;
    setListing((prev) => ({
      ...prev,
      offerValue: sanitizeDiscountValue(raw),
    }));
  }

  function buildOfferTitle(value: string) {
    return buildStorewideDiscountTitle(value);
  }

  async function handleBannerChange(value: PartnerBannerUploadValue | null) {
    if (!partner || !isListingEditable) return;

    if (!value) {
      setListing((prev) => ({
        ...prev,
        bannerImageUrl: null,
        bannerOriginalUrl: null,
        bannerCrop: null,
      }));
      return;
    }

    let existingOriginalUrl: string | null = null;
    setListing((prev) => {
      existingOriginalUrl = prev.bannerOriginalUrl;
      return {
        ...prev,
        bannerImageUrl: value.previewUrl,
        bannerCrop: value.crop,
      };
    });

    setUploading("banner");
    setStatus(null);
    try {
      const result = await uploadPartnerBanner(partner.user_id, {
        croppedFile: value.croppedFile,
        originalFile: value.recropOnly ? null : value.originalFile,
        crop: value.crop,
        existingOriginalUrl,
      });
      setListing((prev) => ({
        ...prev,
        bannerImageUrl: result.bannerUrl,
        bannerOriginalUrl: result.bannerOriginalUrl,
        bannerCrop: result.bannerCrop,
      }));
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Banner upload failed.",
      });
    } finally {
      setUploading(null);
    }
  }

  async function handleLogoChange(value: PartnerLogoUploadValue | null) {
    if (!partner || !isListingEditable) return;

    if (!value) {
      setListing((prev) => ({
        ...prev,
        logoUrl: null,
        logoOriginalUrl: null,
        logoCrop: null,
      }));
      try {
        await persistPartnerLogo(partner.user_id, {
          logoUrl: null,
          logoOriginalUrl: null,
          logoCrop: null,
        });
      } catch (error) {
        setStatus({
          type: "error",
          message: error instanceof Error ? error.message : "Logo removal failed.",
        });
      }
      return;
    }

    let existingOriginalUrl: string | null = null;
    setListing((prev) => {
      existingOriginalUrl = prev.logoOriginalUrl;
      return {
        ...prev,
        logoUrl: value.previewUrl,
        logoCrop: value.crop,
      };
    });

    setUploading("logo");
    setStatus(null);
    try {
      const result = await uploadPartnerLogo(partner.user_id, {
        croppedFile: value.croppedFile,
        originalFile: value.recropOnly ? null : value.originalFile,
        crop: value.crop,
        existingOriginalUrl,
      });
      await persistPartnerLogo(partner.user_id, result);
      setListing((prev) => ({
        ...prev,
        logoUrl: result.logoUrl,
        logoOriginalUrl: result.logoOriginalUrl,
        logoCrop: result.logoCrop,
      }));
      setStatus({
        type: "success",
        message: "Logo saved. It will appear across FoodVault shortly.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Logo upload failed.",
      });
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryUpload(
    value: PartnerGalleryUploadValue,
    existingOriginalUrl: string | null
  ): Promise<PartnerGalleryItem> {
    if (!partner) {
      throw new Error("Partner session required.");
    }

    return uploadPartnerGalleryItem(partner.user_id, {
      croppedFile: value.croppedFile,
      originalFile: value.recropOnly ? null : value.originalFile,
      crop: value.crop,
      existingOriginalUrl,
    });
  }

  async function handleAssetUpload(
    file: File,
    kind: PartnerAssetKind,
    apply: (url: string) => void
  ) {
    if (!partner || !isListingEditable) return;
    setUploading(kind);
    setStatus(null);
    try {
      const url = await uploadPartnerAsset(partner.user_id, file, kind);
      apply(url);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Image upload failed.",
      });
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    if (!partner || onboardingState === "APPLICATION_UNDER_REVIEW") return;

    const validation = validateOfferForm(
      listing.offerScope,
      listing.offerValue,
      listing.selectedProductDrafts,
      { requireProducts: listing.offerScope === "selected_products" }
    );
    if (!validation.ok) {
      setStatus({ type: "error", message: validation.message });
      return;
    }

    const nextCategoryError = validateCategoryGroups(listing.categoryGroups);
    if (nextCategoryError) {
      setCategoryError(nextCategoryError);
      setStatus({ type: "error", message: nextCategoryError });
      return;
    }

    const nextSocialErrors = validatePartnerSocialLinks(socialValues);
    if (hasSocialFieldErrors(nextSocialErrors)) {
      setSocialErrors(nextSocialErrors);
      setStatus({
        type: "error",
        message: "Please fix the social media fields highlighted below.",
      });
      return;
    }

    const affiliateValidation = AFFILIATE_PROGRAM_COMING_SOON
      ? ({ ok: true } as const)
      : validateAffiliateProgram({
          enabled: listing.affiliateEnabled,
          commissionPercent: listing.affiliateCommissionPercent,
          cookieDurationDays: listing.affiliateCookieDurationDays,
          programDescription: listing.affiliateProgramDescription,
          affiliateTerms: listing.affiliateTerms,
        });
    if (!affiliateValidation.ok) {
      setStatus({ type: "error", message: affiliateValidation.message });
      return;
    }

    setSaving(true);
    setStatus(null);

    const offerTitle =
      listing.offerScope === "entire_store"
        ? buildOfferTitle(listing.offerValue)
        : "";
    const companyName = finalizeBusinessNameInput(listing.companyName);

    let selectedProducts = [] as import("@/lib/partner-offer").SelectedProduct[];
    try {
      selectedProducts = await uploadSelectedProductDrafts(
        partner.user_id,
        listing.selectedProductDrafts,
        listing.offerValue
      );
    } catch (error) {
      setSaving(false);
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Product upload failed.",
      });
      return;
    }

    const payload: PartnerListingData = {
      companyName,
      websiteUrl: listing.websiteUrl,
      shortDescription: listing.shortDescription,
      brandStory: listing.brandStory,
      primaryDepartment: listing.categoryGroups[0]?.department ?? "",
      subcategories: listing.categoryGroups[0]?.subcategories ?? [],
      categoryGroups: listing.categoryGroups,
      offerType: "Percentage Discount",
      offerValue: listing.offerValue,
      offerTitle,
      offerScope: listing.offerScope,
      selectedProducts,
      supportEmail: listing.supportEmail,
      supportPhone: listing.supportPhone,
      contactName: finalizeBusinessNameInput(listing.contactName, MAX_CONTACT_NAME_LENGTH),
      instagram: listing.instagram,
      facebook: listing.facebook,
      linkedin: listing.linkedin,
      tiktok: listing.tiktok,
      youtube: listing.youtube,
      bannerImageUrl: listing.bannerImageUrl,
      bannerOriginalUrl: listing.bannerOriginalUrl,
      bannerCrop: listing.bannerCrop,
      logoUrl: listing.logoUrl,
      logoOriginalUrl: listing.logoOriginalUrl,
      logoCrop: listing.logoCrop,
      galleryImageUrls: listing.galleryItems.map((item) => item.displayUrl),
      galleryOriginalUrls: listing.galleryItems.map(
        (item) => item.originalUrl ?? item.displayUrl
      ),
      galleryImageCrops: listing.galleryItems.map((item) => item.crop ?? { zoom: 1, x: 0, y: 0 }),
      slug:
        listing.profileSlug ||
        partnerProfileSlug(companyName || partner.business_name || ""),
      affiliateEnabled: AFFILIATE_PROGRAM_COMING_SOON ? false : listing.affiliateEnabled,
      affiliateCommissionPercent: AFFILIATE_PROGRAM_COMING_SOON
        ? ""
        : listing.affiliateCommissionPercent,
      affiliateCookieDurationDays: listing.affiliateCookieDurationDays,
      affiliateProgramDescription: AFFILIATE_PROGRAM_COMING_SOON
        ? ""
        : listing.affiliateProgramDescription,
      affiliateTerms: AFFILIATE_PROGRAM_COMING_SOON ? "" : listing.affiliateTerms,
      affiliateCreatedAt: listing.affiliateCreatedAt,
      affiliateUpdatedAt: null,
    };

    try {
      await updatePartnerListing(partner.user_id, payload);
      setListing((prev) => ({
        ...prev,
        companyName: payload.companyName,
        affiliateCreatedAt:
          payload.affiliateEnabled && !prev.affiliateCreatedAt
            ? new Date().toISOString()
            : prev.affiliateCreatedAt,
      }));
      setStatus({ type: "success", message: "Your listing has been saved." });
      await refreshPartner();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to save listing.",
      });
    } finally {
      setSaving(false);
    }
  }

  const fieldProps = {
    disabled: !isListingEditable,
    className: `${inputClass}${!isListingEditable ? ` ${portalInputDisabled}` : ""}`,
  };

  const offerFieldProps = {
    disabled: !canEditOffer,
    className: `${inputClass}${!canEditOffer ? ` ${portalInputDisabled}` : ""}`,
  };

  const labelClass = portalLabel;
  const helperClass = portalHelper;

  const profileHref = partnerProfilePathFromSlug(
    listing.profileSlug ||
      partnerProfileSlug(listing.companyName || partner?.business_name || "")
  );

  if (loading || !listingLoaded) {
    return (
      <PartnerPortalShell>
        <div className={portalPage}>
          <div className="animate-pulse space-y-4">
            <div className="h-9 w-56 rounded-lg bg-surface" />
            <div className="h-32 rounded-lg bg-surface" />
            <div className="h-48 rounded-lg bg-surface" />
          </div>
        </div>
      </PartnerPortalShell>
    );
  }

  return (
    <PartnerPortalShell>
      <div className={portalPage}>
        <PartnerAffiliateSetupBanner className="mb-5" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={portalPageTitle}>Manage Your Listing</h1>
            <p className={portalPageSubtitle}>
              Update how your brand appears to FoodVault members.
            </p>
          </div>
          <Link href={profileHref} className={portalBtnOutline}>
            Preview Profile
          </Link>
        </div>

        <section className="mt-6 rounded-lg border-2 border-violet-200 bg-violet-50 px-5 py-4 shadow-sm">
          <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
            Member Discount Code
          </p>
          <p className={`${portalMetricValue} mt-0.5 text-primary`}>{listing.memberCode}</p>
          <p className={`${portalHelper} mt-2 font-bold text-foreground`}>
            This is your official FoodVault member discount code. Members will enter this code on
            your website to receive their exclusive discount. Please make sure this exact code has
            been entered and is active in your online store at all times. This code cannot be
            changed.
          </p>
        </section>

        <fieldset disabled={!isListingEditable} className={`mt-6 ${portalSectionStack} disabled:opacity-90`}>
          <div className={`min-w-0 ${portalSectionStack}`}>
            <section className={portalCard}>
              <h2 className={portalSectionTitle}>Business Details</h2>
              <p className={`${portalHelper} mt-1`}>Tell us about your business.</p>
              <div className={`${portalFormGrid} ${portalCardContent}`}>
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input
                    value={listing.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    onBlur={finalizeCompanyName}
                    maxLength={MAX_BUSINESS_NAME_LENGTH}
                    className={`${portalFieldGap} ${fieldProps.className}`}
                    disabled={fieldProps.disabled}
                  />
                </div>
                <div>
                  <label className={labelClass}>Website URL</label>
                  <input
                    value={listing.websiteUrl}
                    onChange={(e) => update("websiteUrl", e.target.value)}
                    className={`${portalFieldGap} ${fieldProps.className}`}
                    disabled={fieldProps.disabled}
                  />
                </div>
              </div>
            </section>

            <section className={portalCard}>
              <h2 className={portalSectionTitle}>Brand Images</h2>
              <div className={`${portalHelper} mt-1 space-y-2`}>
                <p>Show members what makes your brand special.</p>
                <p>
                  Add your logo, banner and a short description. Don&apos;t overthink
                  it—you can update everything later.
                </p>
              </div>
              <div className={`grid gap-5 lg:grid-cols-2 ${portalCardContent}`}>
                <div>
                  <PartnerBannerUploadField
                    variant="compact"
                    previewUrl={listing.bannerImageUrl ?? undefined}
                    existingOriginalUrl={listing.bannerOriginalUrl}
                    existingCrop={listing.bannerCrop}
                    disabled={!isListingEditable || uploading !== null}
                    label="Cover Banner"
                    hint="3:1 wide banner — upload, then adjust crop and zoom"
                    onChange={(value) => void handleBannerChange(value)}
                  />
                  {uploading === "banner" ? (
                    <p className={`${portalHelper} mt-1`}>Uploading banner...</p>
                  ) : null}
                </div>
                <div>
                  <PartnerLogoUploadField
                    variant="compact"
                    businessName={listing.companyName}
                    previewUrl={listing.logoUrl ?? undefined}
                    existingOriginalUrl={listing.logoOriginalUrl}
                    existingCrop={listing.logoCrop}
                    hasStoredCrop={Boolean(listing.logoCrop)}
                    disabled={!isListingEditable || uploading !== null}
                    label="Brand Logo"
                    hint="Circular logo for listings — upload, then adjust crop"
                    onChange={(value) => void handleLogoChange(value)}
                  />
                  {uploading === "logo" ? (
                    <p className={`${portalHelper} mt-1`}>Uploading logo...</p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className={portalCard}>
              <h2 className={portalSectionTitle}>Products & Brand Images</h2>
              <p className={`${portalHelper} mt-1`}>
                Up to 30 gallery images in 4:5 portrait format for your brand profile.
              </p>
              <PartnerGalleryUploadGrid
                variant="compact"
                className={portalCardContent}
                items={listing.galleryItems}
                maxItems={30}
                disabled={!isListingEditable}
                uploading={uploading === "gallery" || uploading === "gallery-original"}
                onChange={(items) => setListing((prev) => ({ ...prev, galleryItems: items }))}
                onUploadItem={async (value) => {
                  if (!partner || !isListingEditable) {
                    throw new Error("Unable to upload gallery image.");
                  }
                  setUploading("gallery");
                  setStatus(null);
                  try {
                    return await handleGalleryUpload(
                      value,
                      value.existingOriginalUrl ?? null
                    );
                  } catch (error) {
                    setStatus({
                      type: "error",
                      message:
                        error instanceof Error ? error.message : "Gallery upload failed.",
                    });
                    throw error;
                  } finally {
                    setUploading(null);
                  }
                }}
              />
            </section>

            <section className={portalCard}>
              <h2 className={portalSectionTitle}>Brand Content</h2>
              <div className={`space-y-3 ${portalCardContent}`}>
                <div>
                  <label className={labelClass}>Short Description (Max 80 chars)</label>
                  <input
                    value={listing.shortDescription}
                    onChange={(e) => update("shortDescription", e.target.value)}
                    className={`${portalFieldGap} ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Brand Story</label>
                  <textarea
                    value={listing.brandStory}
                    onChange={(e) => update("brandStory", e.target.value)}
                    rows={4}
                    className={`${portalFieldGap} ${portalTextarea}`}
                  />
                </div>
              </div>
            </section>

            <section className={portalCard}>
              <h2 className={portalSectionTitle}>Categories</h2>
              <p className={`${portalHelper} mt-1`}>
                Select every category and subcategory that applies to your products. This
                increases your visibility in FoodVault search and helps more members discover
                your brand.
              </p>
              <PartnerCategoriesEditor
                idPrefix="listing"
                className={portalCardContent}
                categoryGroups={listing.categoryGroups}
                onChange={(categoryGroups) => {
                  if (!isListingEditable) return;
                  setListing((prev) => ({ ...prev, categoryGroups }));
                  setCategoryError(validateCategoryGroups(categoryGroups));
                }}
                error={categoryError}
                disabled={!isListingEditable}
                compact
              />
            </section>
          </div>
        </fieldset>

        <section id="offer" className={`${portalCard} mt-6 scroll-mt-20`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={portalSectionTitle}>Member Offer</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide ${offerConfirmed ? "bg-success-light text-success" : "bg-red-100 text-red-600"}`}
            >
              {offerConfirmed ? "Confirmed" : "Not Confirmed"}
            </span>
          </div>
          <div className={`${portalHelper} mt-1 space-y-2`}>
            <p className="font-semibold text-foreground">Your Exclusive Member Offer</p>
            <p>
              How you use FoodVault is completely up to you. Offer one discount across your
              whole website or create different deals on selected products. You can change your
              offers whenever you like, so you&apos;re always in control.
            </p>
            <p>
              FoodVault members are here because they&apos;re actively looking for great deals,
              so a strong member offer gives them another reason to choose your brand.
            </p>
          </div>
          <div className={portalCardContent}>
            <MemberExclusiveOfferFields
              offerScope={listing.offerScope}
              onOfferScopeChange={(offerScope) =>
                setListing((prev) => ({ ...prev, offerScope }))
              }
              discountValue={listing.offerValue}
              onDiscountValueChange={(offerValue) => updateOfferValue(offerValue)}
              selectedProducts={listing.selectedProductDrafts}
              onSelectedProductsChange={(selectedProductDrafts) =>
                setListing((prev) => ({ ...prev, selectedProductDrafts }))
              }
              disabled={offerFieldProps.disabled}
              inputClass={offerFieldProps.className}
              labelClass={labelClass}
              helperClass={helperClass}
              compact
              discountHelperText="Updates the discount shown on your public brand profile."
            />
          </div>
        </section>

        <section id="affiliate" className={`${portalCard} mt-6 scroll-mt-20 opacity-95`}>
          <h2 className={portalSectionTitle}>Affiliate Program (Coming Soon)</h2>
          <div className={portalCardContent}>
            <AffiliateProgramFields
              value={{
                enabled: listing.affiliateEnabled,
                commissionPercent: listing.affiliateCommissionPercent,
                cookieDurationDays: listing.affiliateCookieDurationDays,
                programDescription: listing.affiliateProgramDescription,
                affiliateTerms: listing.affiliateTerms,
              }}
              onChange={(value) =>
                setListing((prev) => ({
                  ...prev,
                  affiliateEnabled: value.enabled,
                  affiliateCommissionPercent: value.commissionPercent,
                  affiliateCookieDurationDays: value.cookieDurationDays,
                  affiliateProgramDescription: value.programDescription,
                  affiliateTerms: value.affiliateTerms,
                }))
              }
              disabled={!isListingEditable}
              inputClass={fieldProps.className}
              labelClass={labelClass}
              helperClass={helperClass}
              compact
              idPrefix="listing-affiliate"
            />
          </div>
        </section>

        <fieldset disabled={!isListingEditable} className={`mt-6 ${portalSectionStack} disabled:opacity-90`}>
          <div className={`min-w-0 ${portalSectionStack}`}>
            <section className={portalCard}>
              <h2 className={portalSectionTitle}>{SOCIAL_PRESENCE_SECTION_TITLE}</h2>
              <p className={`${portalHelper} mt-1`}>{SOCIAL_PRESENCE_SECTION_DESCRIPTION}</p>
              <PartnerSocialFields
                values={socialValues}
                onChange={handleSocialChange}
                errors={socialErrors}
                disabled={!isListingEditable}
                inputClassName={fieldProps.className}
                labelClassName={labelClass}
                fieldGapClass={portalFieldGap}
                layout="grid"
                idPrefix="listing-social"
              />
            </section>

            <section className="rounded-lg border-2 border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
              <h2 className={portalSectionTitle}>Contact Details (Internal Use Only)</h2>
              <p className={`${portalHelper} mt-1`}>
                We&apos;ll only use these details if we need to contact you.
              </p>
              <div className={`${portalFormGrid} ${portalCardContent}`}>
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input
                    value={listing.contactName}
                    onChange={(e) =>
                      update(
                        "contactName",
                        formatBusinessNameInput(e.target.value, MAX_CONTACT_NAME_LENGTH)
                      )
                    }
                    onBlur={() =>
                      setListing((prev) => ({
                        ...prev,
                        contactName: finalizeBusinessNameInput(
                          prev.contactName,
                          MAX_CONTACT_NAME_LENGTH
                        ),
                      }))
                    }
                    maxLength={MAX_CONTACT_NAME_LENGTH}
                    className={`${portalFieldGap} ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Customer Support Email</label>
                  <input
                    value={listing.supportEmail}
                    onChange={(e) => update("supportEmail", e.target.value)}
                    className={`${portalFieldGap} ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Support Phone (Optional)</label>
                  <input
                    value={listing.supportPhone}
                    onChange={(e) => update("supportPhone", e.target.value)}
                    className={`${portalFieldGap} ${inputClass}`}
                  />
                </div>
              </div>
            </section>
          </div>
        </fieldset>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          {status ? (
            <span
              className={`text-sm font-medium ${
                status.type === "success" ? "text-success" : "text-red-600"
              }`}
              role="status"
            >
              {status.message}
            </span>
          ) : (
            <span className="hidden sm:block" />
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={onboardingState === "APPLICATION_UNDER_REVIEW" || saving}
            className={`${portalBtnPrimary} sm:ml-auto`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
