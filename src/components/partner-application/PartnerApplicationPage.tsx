"use client";

import { SafeImage } from "@/components/media/SafeImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PartnerCategoriesEditor } from "@/components/partner/PartnerCategorySelector";
import {
  categoryGroupsFromLegacy,
  emptyCategoryGroup,
  flattenDietaryLifestyleAttributes,
  hydrateCategoryGroupAttributes,
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
import {
  emptyVaultDropFormDraft,
  validateVaultDropForm,
  prepareVaultDropDraftForSubmit,
  vaultDropDraftFromSerializable,
  type VaultDropFormDraft,
} from "@/lib/vault-drop";
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
import { VaultDropFields } from "@/components/partners/VaultDropFields";
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
  createSelectedProductDraft,
  isSelectedProductComplete,
  DEFAULT_PARTNER_DISCOUNT_PERCENT,
  resolvePartnerApplicationDiscountValue,
  MIN_PARTNER_GALLERY_IMAGES,
  MAX_PARTNER_SHORT_DESCRIPTION_LENGTH,
  sanitizeDiscountValue,
  validatePartnerBrandDetails,
  type OfferScope,
  type SelectedProductDraft,
} from "@/lib/partner-offer";
import {
  defaultAffiliateProgramConfig,
  AFFILIATE_PROGRAM_COMING_SOON,
  validateAffiliateProgram,
  type AffiliateProgramConfig,
} from "@/lib/partner-affiliate";
import { createLocalPreviewUrl } from "@/lib/image-preview";
import { PartnerOnboardingProgress } from "./PartnerOnboardingProgress";
import { AddressAutocomplete } from "@/components/common/AddressAutocomplete";
import { ListingModelGatekeeper } from "@/components/hospitality/ListingModelGatekeeper";
import {
  HospitalityOfferFields,
  HospitalityVenueFields,
} from "@/components/hospitality/HospitalityApplicationFields";
import {
  MAX_HOSPITALITY_GALLERY_IMAGES,
  MAX_HOSPITALITY_OFFER_IMAGES,
  MIN_HOSPITALITY_GALLERY_IMAGES,
} from "@/lib/hospitality/constants";
import { capitalizeSentences } from "@/lib/hospitality/text";
import {
  emptyHospitalityApplicationDetails,
  formatHospitalityAddress,
  type HospitalityApplicationDetails,
  type ListingModel,
} from "@/lib/hospitality/types";
import { validateHospitalityApplication } from "@/lib/hospitality/validate";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const errorInputClass =
  "!border-red-500 focus:!border-red-500 focus:!ring-red-500/20";

const errorWrapClass = "rounded-lg border-2 border-red-500 p-2";

const labelClass = "text-sm font-bold text-foreground";

type ApplicationFieldKey =
  | "businessName"
  | "websiteUrl"
  | "banner"
  | "logo"
  | "shortDescription"
  | "brandStory"
  | "gallery"
  | "categories"
  | "discountValue"
  | "selectedProducts"
  | "contactName"
  | "supportEmail"
  | "terms";

type ApplicationFieldErrors = Partial<Record<ApplicationFieldKey, string>>;

const APPLICATION_FIELD_ORDER: ApplicationFieldKey[] = [
  "businessName",
  "websiteUrl",
  "banner",
  "logo",
  "shortDescription",
  "brandStory",
  "gallery",
  "categories",
  "discountValue",
  "selectedProducts",
  "contactName",
  "supportEmail",
  "terms",
];

function isValidWebsiteUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

const DEFAULT_OFFER_TYPE = "Percentage Discount";

const MAX_PRODUCT_GALLERY_IMAGES = 30;
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
      <div className="flex items-center gap-3 border-b border-border pb-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {description ? (
        <div className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
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
          <div className="relative mb-3 h-20 w-full overflow-hidden rounded-lg">
            <SafeImage
              src={preview}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
              fallbackVariant="muted"
            />
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
              void createLocalPreviewUrl(file).then((url) => onChange(file, url));
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
  const [listingModel, setListingModel] = useState<ListingModel | null>(null);
  const [hospitalityDetails, setHospitalityDetails] =
    useState<HospitalityApplicationDetails>(emptyHospitalityApplicationDetails);
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [brandStory, setBrandStory] = useState("");
  const [discountValue, setDiscountValue] = useState(DEFAULT_PARTNER_DISCOUNT_PERCENT);
  const [offerExclusions, setOfferExclusions] = useState("");
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
    () => Array.from({ length: MIN_PARTNER_GALLERY_IMAGES }, () => null)
  );
  const [offerGalleryDraftItems, setOfferGalleryDraftItems] = useState<
    PartnerGalleryDraftItem[]
  >(() => [null]);
  const [affiliateProgram, setAffiliateProgram] = useState<AffiliateProgramConfig>(
    defaultAffiliateProgramConfig()
  );
  const [vaultDrop, setVaultDrop] = useState<VaultDropFormDraft>(emptyVaultDropFormDraft());
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApplicationFieldErrors>({});
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
          setListingModel(draft.listingModel ?? null);
          if (draft.hospitality) {
            setHospitalityDetails({
              ...emptyHospitalityApplicationDetails(),
              ...draft.hospitality,
              offerTitle: capitalizeSentences(draft.hospitality.offerTitle ?? ""),
              offerDescription: capitalizeSentences(
                draft.hospitality.offerDescription ?? ""
              ),
              offerTerms: capitalizeSentences(draft.hospitality.offerTerms ?? ""),
              location: {
                ...emptyHospitalityApplicationDetails().location,
                ...draft.hospitality.location,
              },
            });
          }
          setBusinessName(formatBusinessNameInput(draft.businessName ?? ""));
          setWebsiteUrl(draft.websiteUrl ?? "");
          setShortDescription(
            draft.listingModel === "hospitality_venue"
              ? capitalizeSentences(draft.shortDescription ?? "")
              : (draft.shortDescription ?? "")
          );
          setBrandStory(
            draft.listingModel === "hospitality_venue"
              ? capitalizeSentences(draft.brandStory ?? "")
              : (draft.brandStory ?? "")
          );
          setDiscountValue(
            resolvePartnerApplicationDiscountValue(
              draft.discountValue,
              draft.selectedProducts ?? []
            )
          );
          setOfferExclusions(draft.offerExclusions ?? "");
          const restoredScope =
            draft.offerScope ??
            offerScopeFromLegacyAppliesTo(draft.offerAppliesTo);
          setOfferScope(restoredScope);
          const restoredProducts = (draft.selectedProducts ?? []).map(
            (product, index) => {
              const restored = {
                ...createSelectedProductDraft(product.sortOrder ?? index),
                ...product,
                imageFile: null,
                normalPrice: product.normalPrice ?? "",
              };
              return {
                ...restored,
                collapsed:
                  product.collapsed ?? isSelectedProductComplete(restored),
              };
            }
          );
          setSelectedProducts(
            restoredProducts.length === 0 && restoredScope === "selected_products"
              ? [createSelectedProductDraft(0, { collapsed: false })]
              : restoredProducts
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
          setCategoryGroups(
            hydrateCategoryGroupAttributes(
              draft.categoryGroups?.length
                ? draft.categoryGroups
                : categoryGroupsFromLegacy(
                    draft.primaryDepartment ?? "",
                    draft.subcategories ?? []
                  ),
              draft.dietaryLifestyleAttributes ?? []
            )
          );
          setAffiliateProgram({
            enabled: AFFILIATE_PROGRAM_COMING_SOON ? false : (draft.affiliateEnabled ?? false),
            commissionPercent: draft.affiliateCommissionPercent ?? "",
            cookieDurationDays:
              draft.affiliateCookieDurationDays ??
              defaultAffiliateProgramConfig().cookieDurationDays,
            programDescription: draft.affiliateProgramDescription ?? "",
            affiliateTerms: draft.affiliateTerms ?? "",
          });
          setVaultDrop(vaultDropDraftFromSerializable(draft.vaultDrop));
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
      listingModel: listingModel ?? undefined,
      hospitality: hospitalityDetails,
      location:
        listingModel === "hospitality_venue"
          ? formatHospitalityAddress(hospitalityDetails.location)
          : "New Zealand",
      businessName,
      websiteUrl,
      shortDescription,
      brandStory,
      categoryGroups,
      dietaryLifestyleAttributes: flattenDietaryLifestyleAttributes(categoryGroups),
      discountValue,
      offerExclusions,
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
      vaultDrop: {
        ...vaultDrop,
        products: vaultDrop.products.map((product) => ({
          ...product,
          images: product.images.map((image) =>
            image
              ? {
                  ...image,
                  croppedFile: null as unknown as File,
                  originalFile: null,
                }
              : null
          ),
        })),
      },
    });
  }, [
    session,
    listingModel,
    hospitalityDetails,
    businessName,
    websiteUrl,
    shortDescription,
    brandStory,
    categoryGroups,
    discountValue,
    offerExclusions,
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
    vaultDrop,
  ]);

  const socialValues: PartnerSocialLinks = {
    instagram,
    facebook,
    linkedin,
    tiktok,
    youtube,
  };

  function clearFieldError(field: ApplicationFieldKey) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function inputClassFor(field: ApplicationFieldKey) {
    return fieldErrors[field] ? `${inputClass} ${errorInputClass}` : inputClass;
  }

  function scrollToFirstFieldError(errors: ApplicationFieldErrors) {
    const first = APPLICATION_FIELD_ORDER.find((key) => errors[key]);
    if (!first) return;
    window.requestAnimationFrame(() => {
      document
        .getElementById(`application-field-${first}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function handleOfferScopeChange(scope: OfferScope) {
    setOfferScope(scope);
    clearFieldError("discountValue");
    clearFieldError("selectedProducts");
    if (scope !== "selected_products") return;
    setSelectedProducts((current) =>
      current.length === 0
        ? [createSelectedProductDraft(0, { collapsed: false })]
        : current
    );
  }

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

  function handleSelectVenueAddress(
    formattedAddress: string,
    details?: HospitalityApplicationDetails["location"]
  ) {
    setHospitalityDetails((current) => ({
      ...current,
      location: details
        ? { ...details, displayName: formattedAddress }
        : { ...current.location, displayName: formattedAddress },
    }));
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) return;

    setSubmitError(null);
    setFieldErrors({});

    const galleryItems = galleryDraftItems.filter(
      (item): item is NonNullable<PartnerGalleryDraftItem> => item != null
    );
    const offerGalleryItems = offerGalleryDraftItems.filter(
      (item): item is NonNullable<PartnerGalleryDraftItem> => item != null
    );
    const isHospitality = listingModel === "hospitality_venue";
    const termsAccepted =
      e.currentTarget.elements.namedItem("termsAccepted") instanceof HTMLInputElement &&
      (e.currentTarget.elements.namedItem("termsAccepted") as HTMLInputElement).checked;

    if (isHospitality) {
      const brandDetailsValidation = validatePartnerBrandDetails({
        bannerImageUrl: bannerUpload?.croppedFile ? bannerUpload.previewUrl : null,
        logoUrl: logoUpload?.croppedFile ? logoUpload.previewUrl : null,
        shortDescription,
        brandStory,
        galleryImageCount: galleryItems.length,
      });
      if (!brandDetailsValidation.ok) {
        setSubmitError(brandDetailsValidation.message);
        return;
      }

      const hospitalityValidation = validateHospitalityApplication(hospitalityDetails, {
        galleryImageCount: galleryItems.length,
        offerImageCount: offerGalleryItems.length,
        businessName,
      });
      if (!hospitalityValidation.ok) {
        setSubmitError(hospitalityValidation.message);
        return;
      }
    } else {
      const nextFieldErrors: ApplicationFieldErrors = {};

      if (!businessName.trim()) {
        nextFieldErrors.businessName = "Enter your trading name.";
      }
      if (!websiteUrl.trim()) {
        nextFieldErrors.websiteUrl = "Enter your website URL.";
      } else if (!isValidWebsiteUrl(websiteUrl)) {
        nextFieldErrors.websiteUrl = "Enter a valid website URL, including https://.";
      }

      if (!bannerUpload?.croppedFile) {
        nextFieldErrors.banner = "Upload a banner image.";
      }
      if (!logoUpload?.croppedFile) {
        nextFieldErrors.logo = "Upload a brand logo.";
      }
      if (!shortDescription.trim()) {
        nextFieldErrors.shortDescription = "Enter a short description.";
      }
      if (!brandStory.trim()) {
        nextFieldErrors.brandStory = "Add your brand story.";
      }
      if (galleryItems.length < MIN_PARTNER_GALLERY_IMAGES) {
        nextFieldErrors.gallery = `Upload at least ${MIN_PARTNER_GALLERY_IMAGES} gallery images.`;
      }

      const nextCategoryError = validateCategoryGroups(categoryGroups);
      if (nextCategoryError) {
        setCategoryError(nextCategoryError);
        nextFieldErrors.categories = nextCategoryError;
      }

      const discount = Number(sanitizeDiscountValue(discountValue));
      if (!discount || discount < 1 || discount > 99) {
        nextFieldErrors.discountValue = "Enter a discount between 1 and 99.";
      }

      if (offerScope === "selected_products") {
        const incompleteIndex = selectedProducts.findIndex(
          (product) => !isSelectedProductComplete(product)
        );
        if (selectedProducts.length === 0 || incompleteIndex >= 0) {
          nextFieldErrors.selectedProducts =
            selectedProducts.length === 0
              ? "Add at least one selected product."
              : "Complete the highlighted product fields.";
          setSelectedProducts((current) => {
            if (current.length === 0) {
              return [createSelectedProductDraft(0, { collapsed: false })];
            }
            const index = current.findIndex(
              (product) => !isSelectedProductComplete(product)
            );
            if (index < 0) return current;
            return current.map((product, productIndex) => ({
              ...product,
              collapsed: productIndex !== index,
            }));
          });
        }
      }

      if (!contactName.trim()) {
        nextFieldErrors.contactName = "Enter a contact name.";
      }
      if (!supportEmail.trim()) {
        nextFieldErrors.supportEmail = "Enter a customer support email.";
      } else if (!isValidEmail(supportEmail)) {
        nextFieldErrors.supportEmail = "Enter a valid email address.";
      }
      if (!termsAccepted) {
        nextFieldErrors.terms = "Please agree to the Partner Terms of Service.";
      }

      const affiliateValidation = AFFILIATE_PROGRAM_COMING_SOON
        ? ({ ok: true } as const)
        : validateAffiliateProgram(affiliateProgram);
      const preparedVaultDrop = prepareVaultDropDraftForSubmit(vaultDrop);
      const vaultDropValidation = validateVaultDropForm(preparedVaultDrop, {
        requireComplete: preparedVaultDrop.enabled,
      });
      const nextSocialErrors = validatePartnerSocialLinks(socialValues);
      const hasSocialErrors = hasSocialFieldErrors(nextSocialErrors);

      if (Object.keys(nextFieldErrors).length > 0 || hasSocialErrors) {
        if (hasSocialErrors) setSocialErrors(nextSocialErrors);
        setFieldErrors(nextFieldErrors);
        setSubmitError(
          hasSocialErrors && Object.keys(nextFieldErrors).length === 0
            ? "Please fix the social media fields highlighted below."
            : "Please complete the highlighted fields above."
        );
        scrollToFirstFieldError(nextFieldErrors);
        return;
      }

      if (!affiliateValidation.ok) {
        setSubmitError(affiliateValidation.message);
        return;
      }
      if (!vaultDropValidation.ok) {
        setSubmitError(vaultDropValidation.message);
        return;
      }
    }

    if (isHospitality) {
      const nextSocialErrors = validatePartnerSocialLinks(socialValues);
      if (hasSocialFieldErrors(nextSocialErrors)) {
        setSocialErrors(nextSocialErrors);
        setSubmitError("Please fix the social media fields highlighted below.");
        return;
      }
    }

    startSubmitTransition(async () => {
    try {
      const record = await submitPartnerApplication(
        session.id,
        {
          listingModel: listingModel ?? "online_brand",
          hospitality: hospitalityDetails,
          location: isHospitality
            ? formatHospitalityAddress(hospitalityDetails.location)
            : "New Zealand",
          businessName: finalizeBusinessNameInput(businessName),
          websiteUrl: isHospitality ? websiteUrl.trim() : websiteUrl,
          shortDescription,
          brandStory,
          categoryGroups,
          dietaryLifestyleAttributes: flattenDietaryLifestyleAttributes(categoryGroups),
          offerType: isHospitality
            ? hospitalityDetails.offerTitle || hospitalityDetails.offerCategory
            : DEFAULT_OFFER_TYPE,
          discountValue: isHospitality
            ? hospitalityDetails.offerTitle.replace(/\D/g, "") || "10"
            : discountValue,
          offerExclusions: isHospitality
            ? hospitalityDetails.offerTerms
            : offerExclusions,
          offerScope,
          selectedProducts: isHospitality ? [] : selectedProducts,
          supportEmail,
          supportPhone: isHospitality ? hospitalityDetails.phone : supportPhone,
          contactName: finalizeBusinessNameInput(contactName, MAX_CONTACT_NAME_LENGTH),
          instagram,
          facebook,
          linkedin,
          tiktok,
          youtube,
          affiliateEnabled: AFFILIATE_PROGRAM_COMING_SOON ? false : affiliateProgram.enabled,
          affiliateCommissionPercent: AFFILIATE_PROGRAM_COMING_SOON
            ? ""
            : affiliateProgram.commissionPercent,
          affiliateCookieDurationDays: affiliateProgram.cookieDurationDays,
          affiliateProgramDescription: AFFILIATE_PROGRAM_COMING_SOON
            ? ""
            : affiliateProgram.programDescription,
          affiliateTerms: AFFILIATE_PROGRAM_COMING_SOON ? "" : affiliateProgram.affiliateTerms,
          vaultDrop,
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
          galleryItems: galleryItems.slice(
            0,
            isHospitality ? MAX_HOSPITALITY_GALLERY_IMAGES : MAX_PRODUCT_GALLERY_IMAGES
          ),
          offerGalleryItems: isHospitality
            ? offerGalleryItems.slice(0, MAX_HOSPITALITY_OFFER_IMAGES)
            : undefined,
        }
      );
      await notifyAdminPartnerListingSubmittedAction(record.id);
      clearPartnerApplicationDraft(session.id);
      router.push(
        isHospitality
          ? `${PARTNER_APPLICATION_SUBMITTED_PATH}?listing=hospitality_venue`
          : PARTNER_APPLICATION_SUBMITTED_PATH
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit your application."
      );
    }
    });
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

  if (!listingModel) {
    return (
      <>
        <PartnerOnboardingProgress currentStep={2} />
        <ListingModelGatekeeper onSelect={setListingModel} />
      </>
    );
  }

  const isHospitalityForm = listingModel === "hospitality_venue";

  return (
    <>
      <PartnerOnboardingProgress currentStep={2} />

      <section className="bg-background py-3 sm:py-3.5 md:py-5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-4xl lg:px-8">
          <div className="text-center lg:text-left">
            <h1 className="text-[18px] font-bold tracking-tight text-primary">
              Let&apos;s get started!
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {isHospitalityForm
                ? "Complete your venue application so Kiwi members can find you, visit in person, and redeem your member offer at the counter."
                : "We're excited to see what your brand has to offer! Complete the application below with as much detail as possible. Once approved, your brand will be live on FoodVault, where Kiwi members can discover you, visit your website, and access your exclusive member offer."}
            </p>
            <button
              type="button"
              onClick={() => setListingModel(null)}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              {isHospitalityForm
                ? "Change listing type (currently Hospitality Venue)"
                : "Change listing type (currently Online Kiwi Brand)"}
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate={!isHospitalityForm}
            className="mt-5 space-y-5"
          >
            <section className="rounded-lg border border-border bg-background p-3 shadow-sm sm:p-4">
              <SectionHeader
                title="Business Details"
                description={<p>Tell us about your business.</p>}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
                  </svg>
                }
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div id="application-field-businessName">
                  <label htmlFor="businessName" className={labelClass}>
                    {isHospitalityForm ? "Business Name" : "Trading Name"}{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    required
                    aria-invalid={fieldErrors.businessName ? true : undefined}
                    maxLength={MAX_BUSINESS_NAME_LENGTH}
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(formatBusinessNameInput(e.target.value));
                      clearFieldError("businessName");
                    }}
                    onBlur={(e) =>
                      setBusinessName(finalizeBusinessNameInput(e.target.value))
                    }
                    placeholder="e.g. Artisan Coffee Co"
                    className={`mt-1 ${inputClassFor("businessName")}`}
                  />
                  <FieldErrorText message={fieldErrors.businessName} />
                </div>
                <div id="application-field-websiteUrl">
                  <label htmlFor="websiteUrl" className={labelClass}>
                    {isHospitalityForm ? "Website (Optional)" : "Website URL"}
                    {!isHospitalityForm ? (
                      <>
                        {" "}
                        <span className="text-red-600">*</span>
                      </>
                    ) : null}
                  </label>
                  <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    required={!isHospitalityForm}
                    aria-invalid={fieldErrors.websiteUrl ? true : undefined}
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      clearFieldError("websiteUrl");
                    }}
                    placeholder="https://yourbrand.com"
                    className={`mt-1 ${inputClassFor("websiteUrl")}`}
                  />
                  <FieldErrorText message={fieldErrors.websiteUrl} />
                </div>
              </div>
              {isHospitalityForm ? (
                <HospitalityVenueFields
                  value={hospitalityDetails}
                  onChange={setHospitalityDetails}
                  disabled={isSubmitPending}
                  addressField={
                    <AddressAutocomplete
                      value={formatHospitalityAddress(hospitalityDetails.location)}
                      onSelectAddress={handleSelectVenueAddress}
                      disabled={isSubmitPending}
                      label="Venue Address"
                      required
                    />
                  }
                />
              ) : (
              <div className="mt-2">
                <label htmlFor="location" className={labelClass}>
                  Main Operating Location
                </label>
                <select
                  id="location"
                  name="location"
                  disabled
                  value="New Zealand"
                  className={`mt-1 ${inputClass} bg-surface text-muted-foreground`}
                >
                  <option value="New Zealand">New Zealand</option>
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  FoodVault is currently exclusive to New Zealand business only.
                </p>
              </div>
              )}
            </section>

            <section className="rounded-lg border border-border bg-background p-3 shadow-sm sm:p-4">
              <SectionHeader
                title={isHospitalityForm ? "Details" : "Brand Details"}
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
              <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
                <div
                  id="application-field-banner"
                  className={fieldErrors.banner ? errorWrapClass : undefined}
                >
                  <PartnerBannerUploadField
                    variant="compact"
                    previewUrl={bannerUpload?.previewUrl}
                    label="Banner Image *"
                    hint="Wide 3:1 cover image for your brand profile — upload, then adjust crop and zoom"
                    onChange={(value) => {
                      setBannerUpload(value);
                      clearFieldError("banner");
                    }}
                  />
                  <FieldErrorText message={fieldErrors.banner} />
                </div>
                <div
                  id="application-field-logo"
                  className={fieldErrors.logo ? errorWrapClass : undefined}
                >
                  <PartnerLogoUploadField
                    variant="compact"
                    businessName={businessName}
                    previewUrl={logoUpload?.previewUrl}
                    hasStoredCrop={Boolean(logoUpload)}
                    label="Brand Logo *"
                    hint="Upload your logo, then adjust how it appears in the circular frame"
                    onChange={(value) => {
                      setLogoUpload(value);
                      clearFieldError("logo");
                    }}
                  />
                  <FieldErrorText message={fieldErrors.logo} />
                </div>
              </div>
              <div id="application-field-shortDescription" className="mt-2">
                <label htmlFor="shortDescription" className={labelClass}>
                  Short Description (Max 100 characters) <span className="text-red-600">*</span>
                </label>
                <input
                  id="shortDescription"
                  name="shortDescription"
                  required
                  aria-invalid={fieldErrors.shortDescription ? true : undefined}
                  maxLength={MAX_PARTNER_SHORT_DESCRIPTION_LENGTH}
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(
                      isHospitalityForm
                        ? capitalizeSentences(e.target.value)
                        : e.target.value
                    );
                    clearFieldError("shortDescription");
                  }}
                  placeholder="Freshly baked bread delivered to your door"
                  className={`mt-2 ${inputClassFor("shortDescription")}`}
                />
                <FieldErrorText message={fieldErrors.shortDescription} />
              </div>
              <div id="application-field-brandStory" className="mt-2">
                <label htmlFor="brandStory" className={labelClass}>
                  Your Story <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="brandStory"
                  name="brandStory"
                  required
                  aria-invalid={fieldErrors.brandStory ? true : undefined}
                  rows={5}
                  value={brandStory}
                  onChange={(e) => {
                    setBrandStory(
                      isHospitalityForm
                        ? capitalizeSentences(e.target.value)
                        : e.target.value
                    );
                    clearFieldError("brandStory");
                  }}
                  placeholder="Tell members about your brand, values, and what makes your products special..."
                  className={`mt-1 resize-y ${inputClassFor("brandStory")}`}
                />
                <FieldErrorText message={fieldErrors.brandStory} />
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-3 shadow-sm sm:p-4">
              <SectionHeader
                title={isHospitalityForm ? "Products & Gallery" : "Products & Brand Images"}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                }
              />
              <p className="mt-3 text-sm text-muted-foreground">
                {isHospitalityForm
                  ? `Upload at least ${MIN_HOSPITALITY_GALLERY_IMAGES} photos of your interior, signature dishes, or menu highlights (maximum ${MAX_HOSPITALITY_GALLERY_IMAGES}).`
                  : `Upload at least ${MIN_PARTNER_GALLERY_IMAGES} high-quality images of your products or brand (maximum ${MAX_PRODUCT_GALLERY_IMAGES}). Images are cropped to a 4:5 portrait format, like Instagram.`}
              </p>
              <div
                id="application-field-gallery"
                className={fieldErrors.gallery ? errorWrapClass : undefined}
              >
                <PartnerGalleryDraftGrid
                  variant="compact"
                  className="mt-2"
                  items={galleryDraftItems}
                  minItems={
                    isHospitalityForm
                      ? MIN_HOSPITALITY_GALLERY_IMAGES
                      : MIN_PARTNER_GALLERY_IMAGES
                  }
                  maxItems={
                    isHospitalityForm
                      ? MAX_HOSPITALITY_GALLERY_IMAGES
                      : MAX_PRODUCT_GALLERY_IMAGES
                  }
                  disabled={isSubmitPending}
                  onChange={(items) => {
                    setGalleryDraftItems(items);
                    clearFieldError("gallery");
                  }}
                />
                <FieldErrorText message={fieldErrors.gallery} />
              </div>
            </section>

            {isHospitalityForm ? (
            <section className="rounded-lg border border-success/20 bg-success-light/40 p-3 sm:p-4">
              <SectionHeader
                title="Member Offer"
                description={
                  <p>
                    Describe the in-person offer members can redeem at your venue, and add photos
                    of that offer.
                  </p>
                }
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                  </svg>
                }
              />
              <div className="mt-3">
                <HospitalityOfferFields
                  value={hospitalityDetails}
                  onChange={setHospitalityDetails}
                  disabled={isSubmitPending}
                />
              </div>
              <div className="mt-5">
                <p className={labelClass}>Offer photos</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add up to {MAX_HOSPITALITY_OFFER_IMAGES} photos of the member offer described
                  above. These appear in What you get on your profile, separate from Gallery.
                </p>
                <PartnerGalleryDraftGrid
                  variant="compact"
                  className="mt-2"
                  items={offerGalleryDraftItems}
                  minItems={0}
                  maxItems={MAX_HOSPITALITY_OFFER_IMAGES}
                  disabled={isSubmitPending}
                  onChange={setOfferGalleryDraftItems}
                />
              </div>
            </section>
            ) : (
            <section
              id="application-field-categories"
              className={`rounded-lg border bg-background p-3 shadow-sm sm:p-4 ${
                fieldErrors.categories ? "border-red-500" : "border-border"
              }`}
            >
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
                className="mt-3"
                departmentLabel="Primary Department"
                categoryGroups={categoryGroups}
                onChange={(groups) => {
                  setCategoryGroups(groups);
                  setCategoryError(validateCategoryGroups(groups));
                  clearFieldError("categories");
                }}
                error={fieldErrors.categories ?? categoryError}
                disabled={isSubmitPending}
              />
            </section>
            )}

            {isHospitalityForm ? null : (
            <section
              id="application-field-discountValue"
              className={`rounded-lg border p-3 sm:p-4 ${
                fieldErrors.discountValue || fieldErrors.selectedProducts
                  ? "border-red-500 bg-success-light/40"
                  : "border-success/20 bg-success-light/40"
              }`}
            >
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
              <div id="application-field-selectedProducts" className="mt-3">
                <MemberExclusiveOfferFields
                  offerScope={offerScope}
                  onOfferScopeChange={handleOfferScopeChange}
                  discountValue={discountValue}
                  onDiscountValueChange={(value) => {
                    setDiscountValue(value);
                    clearFieldError("discountValue");
                  }}
                  offerExclusions={offerExclusions}
                  onOfferExclusionsChange={setOfferExclusions}
                  selectedProducts={selectedProducts}
                  onSelectedProductsChange={(products) => {
                    setSelectedProducts(products);
                    clearFieldError("selectedProducts");
                  }}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  discountError={fieldErrors.discountValue}
                  productsError={fieldErrors.selectedProducts}
                  highlightIncompleteProducts={Boolean(fieldErrors.selectedProducts)}
                />
              </div>
            </section>
            )}

            {isHospitalityForm ? null : (
            <section id="flash-sale" className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 shadow-sm scroll-mt-20 sm:p-4">
              <SectionHeader
                title="FLASH SALE (Optional)"
                description={
                  <p>
                    Optional clearance offer for deleted SKUs, old packaging, surplus stock, or
                    short-term bulk deals.
                  </p>
                }
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <div className="mt-3">
                <VaultDropFields
                  value={vaultDrop}
                  onChange={setVaultDrop}
                  disabled={isSubmitPending}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  idPrefix="application-vault-drop"
                  scrollAnchorId="vault-drop"
                />
              </div>
            </section>
            )}

            {isHospitalityForm ? null : (
            <section className="rounded-lg border border-border bg-background p-3 opacity-95 shadow-sm sm:p-4">
              <SectionHeader
                title="Affiliate Program (Coming Soon)"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                }
              />
              <div className="mt-3">
                <AffiliateProgramFields
                  value={affiliateProgram}
                  onChange={setAffiliateProgram}
                  disabled={isSubmitPending}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  idPrefix="application-affiliate"
                />
              </div>
            </section>
            )}

            <section className="rounded-lg border border-border bg-background p-3 shadow-sm sm:p-4">
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

            <section className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-3 shadow-sm sm:p-4">
              <SectionHeader
                title="Contact Details (Internal Use Only)"
                description={<p>We&apos;ll only use these details if we need to contact you.</p>}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div id="application-field-contactName">
                  <label htmlFor="contactName" className={labelClass}>
                    Contact Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    required
                    aria-invalid={fieldErrors.contactName ? true : undefined}
                    maxLength={MAX_CONTACT_NAME_LENGTH}
                    value={contactName}
                    onChange={(e) => {
                      setContactName(
                        formatBusinessNameInput(e.target.value, MAX_CONTACT_NAME_LENGTH)
                      );
                      clearFieldError("contactName");
                    }}
                    onBlur={(e) =>
                      setContactName(
                        finalizeBusinessNameInput(e.target.value, MAX_CONTACT_NAME_LENGTH)
                      )
                    }
                    placeholder="e.g. Jane Smith"
                    className={`mt-1 ${inputClassFor("contactName")}`}
                  />
                  <FieldErrorText message={fieldErrors.contactName} />
                </div>
                <div id="application-field-supportEmail">
                  <label htmlFor="supportEmail" className={labelClass}>
                    Customer Support Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="supportEmail"
                    name="supportEmail"
                    type="email"
                    required
                    aria-invalid={fieldErrors.supportEmail ? true : undefined}
                    value={supportEmail}
                    onChange={(e) => {
                      setSupportEmail(e.target.value);
                      clearFieldError("supportEmail");
                    }}
                    placeholder="support@yourbrand.co.nz"
                    className={`mt-1 ${inputClassFor("supportEmail")}`}
                  />
                  <FieldErrorText message={fieldErrors.supportEmail} />
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
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <label
                id="application-field-terms"
                className={`flex items-start gap-3 rounded-md p-2 ${
                  fieldErrors.terms ? "border border-red-500 bg-red-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="termsAccepted"
                  required
                  aria-invalid={fieldErrors.terms ? true : undefined}
                  onChange={() => clearFieldError("terms")}
                  className={`mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary ${
                    fieldErrors.terms ? "border-red-500" : ""
                  }`}
                />
                <span className="text-sm leading-relaxed text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/terms" className="font-semibold text-primary hover:text-primary-hover">
                    Partner Terms of Service
                  </Link>{" "}
                  and confirm that the products meet FoodVault&apos;s quality standards.
                </span>
              </label>
              <FieldErrorText message={fieldErrors.terms} />

              <button
                type="submit"
                disabled={isSubmitPending}
                className="fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-sm px-6 py-2 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitPending ? "Submitting..." : "Submit Application"}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              {submitError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600" role="alert">
                  {submitError}
                </p>
              ) : null}
            </section>
          </form>
        </div>
      </section>
    </>
  );
}
