"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PartnerCategoriesEditor } from "@/components/partner/PartnerCategorySelector";
import {
  categoryGroupsFromLegacy,
  emptyCategoryGroup,
  validateCategoryGroups,
  type PartnerCategoryGroup,
} from "@/data/partner-categories";
import {
  clearPartnerApplicationDraft,
  getPartnerSession,
  loadPartnerApplicationDraft,
  PARTNER_CREATE_ACCOUNT_PATH,
  savePartnerApplicationDraft,
  PARTNER_APPLICATION_SUBMITTED_PATH,
  type PartnerSession,
} from "@/lib/partner-auth";
import { getPartnerRecord, submitPartnerApplication } from "@/lib/partner-data";
import { notifyAdminPartnerListingSubmittedAction } from "@/lib/partner/submission-notifications";
import { PARTNER_DASHBOARD_PATH } from "@/lib/auth";
import {
  finalizeBusinessNameInput,
  formatBusinessNameInput,
  MAX_BUSINESS_NAME_LENGTH,
  MAX_CONTACT_NAME_LENGTH,
} from "@/lib/business-name";
import {
  PartnerLogoUploadField,
  type PartnerLogoUploadValue,
} from "@/components/partners/PartnerLogoUploadField";
import {
  PartnerBannerUploadField,
  type PartnerBannerUploadValue,
} from "@/components/partners/PartnerBannerUploadField";
import {
  PartnerGalleryDraftGrid,
  type PartnerGalleryDraftItem,
} from "@/components/partners/PartnerGalleryUploadGrid";
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
  offerScopeFromLegacyAppliesTo,
  sanitizeDiscountValue,
  createSelectedProductDraft,
  deriveSelectedProductsDiscount,
  validateOfferForm,
  type OfferScope,
  type SelectedProductDraft,
} from "@/lib/partner-offer";
import {
  defaultAffiliateProgramConfig,
  validateAffiliateProgram,
  type AffiliateProgramConfig,
} from "@/lib/partner-affiliate";
import { PartnerOnboardingProgress } from "./PartnerOnboardingProgress";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "text-sm font-bold text-foreground";

const DEFAULT_OFFER_TYPE = "Percentage Discount";

const MAX_PRODUCT_GALLERY_IMAGES = 30;
const MIN_PRODUCT_GALLERY_IMAGES = 3;
const MAX_SUPPORT_PHONE_LENGTH = 15;

function sanitizePhoneNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, MAX_SUPPORT_PHONE_LENGTH);
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {description ? (
        <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </div>
      ) : null}
    </>
  );
}

function UploadBox({
  id,
  label,
  hint,
  preview,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  preview?: string;
  onChange?: (file: File | undefined, previewUrl: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleRemove(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange?.(undefined, undefined);
  }

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-border bg-surface px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        {preview ? (
          <div className="relative mb-3 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-20 w-full rounded-lg object-cover" />
            {onChange ? (
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white transition-opacity hover:bg-black/80"
              >
                &times;
              </button>
            ) : null}
          </div>
        ) : (
          <svg className="h-7 w-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        )}
        <span className="mt-3 text-sm font-medium text-foreground">{label}</span>
        <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onChange) {
              onChange(file, URL.createObjectURL(file));
            }
          }}
        />
      </label>
    </div>
  );
}

export function PartnerApplicationPage() {
  const router = useRouter();
  const [session, setSession] = useState<PartnerSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [brandStory, setBrandStory] = useState("");
  const [discountValue, setDiscountValue] = useState("10");
  const [offerScope, setOfferScope] = useState<OfferScope>("entire_store");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductDraft[]>([]);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [socialErrors, setSocialErrors] = useState<SocialFieldErrors>({});
  const [categoryGroups, setCategoryGroups] = useState<PartnerCategoryGroup[]>([
    emptyCategoryGroup(),
  ]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [logoUpload, setLogoUpload] = useState<PartnerLogoUploadValue | null>(null);
  const [bannerUpload, setBannerUpload] = useState<PartnerBannerUploadValue | null>(null);
  const [galleryDraftItems, setGalleryDraftItems] = useState<PartnerGalleryDraftItem[]>(
    () => Array.from({ length: MIN_PRODUCT_GALLERY_IMAGES }, () => null)
  );
  const [affiliateProgram, setAffiliateProgram] = useState<AffiliateProgramConfig>(
    defaultAffiliateProgramConfig()
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initApplication() {
      try {
        const partnerSession = await getPartnerSession();
        if (cancelled) return;

        if (!partnerSession) {
          router.replace(PARTNER_CREATE_ACCOUNT_PATH);
          return;
        }

        const existingRecord = await getPartnerRecord(partnerSession.id);
        if (cancelled) return;

        if (existingRecord) {
          router.replace(PARTNER_DASHBOARD_PATH);
          return;
        }

        setSession(partnerSession);

        const draft = loadPartnerApplicationDraft(partnerSession.id);
        if (draft) {
          setBusinessName(formatBusinessNameInput(draft.businessName ?? ""));
          setWebsiteUrl(draft.websiteUrl ?? "");
          setShortDescription(draft.shortDescription ?? "");
          setBrandStory(draft.brandStory ?? "");
          setDiscountValue(
            sanitizeDiscountValue(
              draft.discountValue ??
                (deriveSelectedProductsDiscount(draft.selectedProducts ?? []) || "10")
            )
          );
          setOfferScope(
            draft.offerScope ??
              offerScopeFromLegacyAppliesTo(draft.offerAppliesTo)
          );
          setSelectedProducts(
            (draft.selectedProducts ?? []).map((product, index) => ({
              ...createSelectedProductDraft(product.sortOrder ?? index),
              ...product,
              imageFile: null,
              normalPrice: product.normalPrice ?? "",
            }))
          );
          setSupportEmail(draft.supportEmail ?? partnerSession.email);
          setSupportPhone(sanitizePhoneNumber(draft.supportPhone ?? ""));
          setContactName(
            formatBusinessNameInput(draft.contactName ?? "", MAX_CONTACT_NAME_LENGTH)
          );
          setInstagram(draft.instagram ?? "");
          setFacebook(draft.facebook ?? "");
          setLinkedin(draft.linkedin ?? "");
          setTiktok(draft.tiktok ?? "");
          setYoutube(draft.youtube ?? "");
          if (draft.categoryGroups?.length) {
            setCategoryGroups(draft.categoryGroups);
          } else {
            setCategoryGroups(
              categoryGroupsFromLegacy(
                draft.primaryDepartment ?? "",
                draft.subcategories ?? []
              )
            );
          }
          setAffiliateProgram({
            enabled: draft.affiliateEnabled ?? false,
            commissionPercent: draft.affiliateCommissionPercent ?? "",
            cookieDurationDays:
              draft.affiliateCookieDurationDays ??
              defaultAffiliateProgramConfig().cookieDurationDays,
            programDescription: draft.affiliateProgramDescription ?? "",
            affiliateTerms: draft.affiliateTerms ?? "",
          });
        } else {
          setSupportEmail(partnerSession.email);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load your application. Please refresh and try again."
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    void initApplication();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!session) return;

    savePartnerApplicationDraft(session.id, {
      businessName,
      websiteUrl,
      shortDescription,
      brandStory,
      categoryGroups,
      discountValue,
      offerScope,
      selectedProducts: selectedProducts.map((product) => ({
        ...product,
        imageFile: null,
      })),
      supportEmail,
      supportPhone,
      contactName,
      instagram,
      facebook,
      linkedin,
      tiktok,
      youtube,
      affiliateEnabled: affiliateProgram.enabled,
      affiliateCommissionPercent: affiliateProgram.commissionPercent,
      affiliateCookieDurationDays: affiliateProgram.cookieDurationDays,
      affiliateProgramDescription: affiliateProgram.programDescription,
      affiliateTerms: affiliateProgram.affiliateTerms,
    });
  }, [
    session,
    businessName,
    websiteUrl,
    shortDescription,
    brandStory,
    categoryGroups,
    discountValue,
    offerScope,
    selectedProducts,
    supportEmail,
    supportPhone,
    contactName,
    instagram,
    facebook,
    linkedin,
    tiktok,
    youtube,
    affiliateProgram,
  ]);

  const socialValues: PartnerSocialLinks = {
    instagram,
    facebook,
    linkedin,
    tiktok,
    youtube,
  };

  function handleSocialChange(field: SocialFieldKey, value: string) {
    switch (field) {
      case "instagram":
        setInstagram(value);
        break;
      case "facebook":
        setFacebook(value);
        break;
      case "linkedin":
        setLinkedin(value);
        break;
      case "tiktok":
        setTiktok(value);
        break;
      case "youtube":
        setYoutube(value);
        break;
    }

    setSocialErrors((current) => patchSocialFieldError(current, field, value));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    setSubmitError(null);

    const galleryItems = galleryDraftItems.filter(
      (item): item is NonNullable<PartnerGalleryDraftItem> => item != null
    );

    if (galleryItems.length < MIN_PRODUCT_GALLERY_IMAGES) {
      setSubmitError(
        `Please upload at least ${MIN_PRODUCT_GALLERY_IMAGES} gallery images.`
      );
      setSubmitting(false);
      return;
    }

    const offerValidation = validateOfferForm(
      offerScope,
      discountValue,
      selectedProducts,
      { requireProducts: offerScope === "selected_products" }
    );
    if (!offerValidation.ok) {
      setSubmitError(offerValidation.message);
      setSubmitting(false);
      return;
    }

    const nextSocialErrors = validatePartnerSocialLinks(socialValues);
    if (hasSocialFieldErrors(nextSocialErrors)) {
      setSocialErrors(nextSocialErrors);
      setSubmitError("Please fix the social media fields highlighted below.");
      setSubmitting(false);
      return;
    }

    const nextCategoryError = validateCategoryGroups(categoryGroups);
    if (nextCategoryError) {
      setCategoryError(nextCategoryError);
      setSubmitError(nextCategoryError);
      setSubmitting(false);
      return;
    }

    const affiliateValidation = validateAffiliateProgram(affiliateProgram);
    if (!affiliateValidation.ok) {
      setSubmitError(affiliateValidation.message);
      setSubmitting(false);
      return;
    }

    try {
      const record = await submitPartnerApplication(
        session.id,
        {
          businessName: finalizeBusinessNameInput(businessName),
          websiteUrl,
          shortDescription,
          brandStory,
          categoryGroups,
          offerType: DEFAULT_OFFER_TYPE,
          discountValue,
          offerScope,
          selectedProducts,
          supportEmail,
          supportPhone,
          contactName: finalizeBusinessNameInput(contactName, MAX_CONTACT_NAME_LENGTH),
          instagram,
          facebook,
          linkedin,
          tiktok,
          youtube,
          affiliateEnabled: affiliateProgram.enabled,
          affiliateCommissionPercent: affiliateProgram.commissionPercent,
          affiliateCookieDurationDays: affiliateProgram.cookieDurationDays,
          affiliateProgramDescription: affiliateProgram.programDescription,
          affiliateTerms: affiliateProgram.affiliateTerms,
        },
        {
          bannerUpload: bannerUpload
            ? {
                croppedFile: bannerUpload.croppedFile,
                originalFile: bannerUpload.originalFile,
                crop: bannerUpload.crop,
              }
            : null,
          logoFile: logoUpload?.croppedFile ?? null,
          logoOriginalFile: logoUpload?.originalFile ?? null,
          logoCrop: logoUpload?.crop ?? null,
          galleryItems: galleryItems.slice(0, MAX_PRODUCT_GALLERY_IMAGES),
        }
      );
      await notifyAdminPartnerListingSubmittedAction(record.id);
      clearPartnerApplicationDraft(session.id);
      router.push(PARTNER_APPLICATION_SUBMITTED_PATH);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit your application."
      );
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your application...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="fv-btn-primary mt-4 inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PartnerOnboardingProgress currentStep={2} />

      <section className="bg-background py-6 sm:py-7 md:py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-4xl lg:px-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Join FOODVAULT
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Apply today and connect with members actively looking to save money
              while discovering new food, beverage and lifestyle brands.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Reach New Customers",
                description: "Connect with members searching for new brands and better value.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                ),
              },
              {
                title: "Drive Direct Sales",
                description:
                  "Members purchase directly from your website. You keep control of the customer experience.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                ),
              },
              {
                title: "Grow Your Brand",
                description:
                  "Gain exposure through search categories and promotions across FoodVault.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                ),
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {card.icon}
                  </svg>
                </span>
                <h3 className="mt-4 font-bold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-10">
            <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
              <SectionHeader
                title="Business Details"
                description={<p>Tell us about your business.</p>}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
                  </svg>
                }
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="businessName" className={labelClass}>
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    required
                    maxLength={MAX_BUSINESS_NAME_LENGTH}
                    value={businessName}
                    onChange={(e) =>
                      setBusinessName(formatBusinessNameInput(e.target.value))
                    }
                    onBlur={(e) =>
                      setBusinessName(finalizeBusinessNameInput(e.target.value))
                    }
                    placeholder="e.g. Artisan Coffee Co"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="websiteUrl" className={labelClass}>
                    Website URL
                  </label>
                  <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="location" className={labelClass}>
                  Main Operating Location
                </label>
                <select
                  id="location"
                  name="location"
                  disabled
                  value="New Zealand"
                  className={`mt-2 ${inputClass} bg-surface text-muted-foreground`}
                >
                  <option value="New Zealand">New Zealand</option>
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  FoodVault is currently exclusive to New Zealand business only.
                </p>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
              <SectionHeader
                title="Brand Details"
                description={
                  <>
                    <p>Show members what makes your brand special.</p>
                    <p>
                      Add your logo, banner and a short description. Don&apos;t overthink
                      it—you can update everything later.
                    </p>
                  </>
                }
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                }
              />
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <PartnerBannerUploadField
                  variant="compact"
                  previewUrl={bannerUpload?.previewUrl}
                  label="Banner Image"
                  hint="Wide 3:1 cover image for your brand profile — upload, then adjust crop and zoom"
                  onChange={setBannerUpload}
                />
                <PartnerLogoUploadField
                  variant="compact"
                  businessName={businessName}
                  previewUrl={logoUpload?.previewUrl}
                  hasStoredCrop={Boolean(logoUpload)}
                  label="Brand Logo"
                  hint="Upload your logo, then adjust how it appears in the circular frame"
                  onChange={setLogoUpload}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="shortDescription" className={labelClass}>
                  Short Description (Max 100 chars)
                </label>
                <input
                  id="shortDescription"
                  name="shortDescription"
                  required
                  maxLength={100}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Freshly baked bread delivered to your door"
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="brandStory" className={labelClass}>
                  Your Story
                </label>
                <textarea
                  id="brandStory"
                  name="brandStory"
                  required
                  rows={5}
                  value={brandStory}
                  onChange={(e) => setBrandStory(e.target.value)}
                  placeholder="Tell members about your brand, values, and what makes your products special..."
                  className={`mt-2 resize-y ${inputClass}`}
                />
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
              <SectionHeader
                title="Products & Brand Images"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                }
              />
              <p className="mt-6 text-sm text-muted-foreground">
                Upload at least {MIN_PRODUCT_GALLERY_IMAGES} high-quality images of your
                products or brand (maximum {MAX_PRODUCT_GALLERY_IMAGES}). Images are
                cropped to a 4:5 portrait format, like Instagram.
              </p>
              <PartnerGalleryDraftGrid
                variant="compact"
                className="mt-4"
                items={galleryDraftItems}
                minItems={MIN_PRODUCT_GALLERY_IMAGES}
                maxItems={MAX_PRODUCT_GALLERY_IMAGES}
                disabled={submitting}
                onChange={setGalleryDraftItems}
              />
            </section>

            <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
              <SectionHeader
                title="Categories"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                }
              />
              <PartnerCategoriesEditor
                idPrefix="application"
                className="mt-6"
                departmentLabel="Primary Department"
                categoryGroups={categoryGroups}
                onChange={(groups) => {
                  setCategoryGroups(groups);
                  setCategoryError(validateCategoryGroups(groups));
                }}
                error={categoryError}
                disabled={submitting}
              />
            </section>

            <section className="rounded-lg border border-success/20 bg-success-light/40 p-6 sm:p-8">
              <SectionHeader
                title="Member Exclusive Offer"
                description={
                  <>
                    <p className="font-semibold text-foreground">Your Exclusive Member Offer</p>
                    <p>
                      How you use FoodVault is completely up to you. Offer one discount across
                      your whole website or create different deals on selected products. You can
                      change your offers whenever you like, so you&apos;re always in control.
                    </p>
                    <p>
                      FoodVault members are here because they&apos;re actively looking for great
                      deals, so a strong member offer gives them another reason to choose your
                      brand.
                    </p>
                  </>
                }
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                  </svg>
                }
              />
              <div className="mt-6">
                <MemberExclusiveOfferFields
                  offerScope={offerScope}
                  onOfferScopeChange={setOfferScope}
                  discountValue={discountValue}
                  onDiscountValueChange={setDiscountValue}
                  selectedProducts={selectedProducts}
                  onSelectedProductsChange={setSelectedProducts}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
              <SectionHeader
                title="Affiliate Program (Optional)"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                }
              />
              <div className="mt-6">
                <AffiliateProgramFields
                  value={affiliateProgram}
                  onChange={setAffiliateProgram}
                  disabled={submitting}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  idPrefix="application-affiliate"
                />
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
              <SectionHeader
                title={SOCIAL_PRESENCE_SECTION_TITLE}
                description={<p>{SOCIAL_PRESENCE_SECTION_DESCRIPTION}</p>}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" />
                  </svg>
                }
              />
              <PartnerSocialFields
                values={socialValues}
                onChange={handleSocialChange}
                errors={socialErrors}
                inputClassName={inputClass}
                labelClassName={labelClass}
                layout="stack"
                idPrefix="application-social"
              />
            </section>

            <section className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8">
              <SectionHeader
                title="Contact Details (Internal Use Only)"
                description={<p>We&apos;ll only use these details if we need to contact you.</p>}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactName" className={labelClass}>
                    Contact Name
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    required
                    maxLength={MAX_CONTACT_NAME_LENGTH}
                    value={contactName}
                    onChange={(e) =>
                      setContactName(
                        formatBusinessNameInput(e.target.value, MAX_CONTACT_NAME_LENGTH)
                      )
                    }
                    onBlur={(e) =>
                      setContactName(
                        finalizeBusinessNameInput(e.target.value, MAX_CONTACT_NAME_LENGTH)
                      )
                    }
                    placeholder="e.g. Jane Smith"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="supportEmail" className={labelClass}>
                    Customer Support Email
                  </label>
                  <input
                    id="supportEmail"
                    name="supportEmail"
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@yourbrand.co.nz"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="supportPhone" className={labelClass}>
                    Support Phone (Optional)
                  </label>
                  <input
                    id="supportPhone"
                    name="supportPhone"
                    type="text"
                    inputMode="numeric"
                    maxLength={MAX_SUPPORT_PHONE_LENGTH}
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(sanitizePhoneNumber(e.target.value))}
                    placeholder="64210000000"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  required
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm leading-relaxed text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/terms" className="font-semibold text-primary hover:text-primary-hover">
                    Partner Terms of Service
                  </Link>{" "}
                  and confirm that the products meet FoodVault&apos;s quality standards.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="assetConsent"
                  required
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm leading-relaxed text-muted-foreground">
                  I consent to FoodVault using my brand assets for promotional
                  and marketing purposes.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-sm px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Application"}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              {submitError ? (
                <p className="text-sm text-red-600">{submitError}</p>
              ) : null}
            </section>
          </form>
        </div>
      </section>
    </>
  );
}
