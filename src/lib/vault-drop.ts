import { formatBusinessNameInput } from "@/lib/business-name";
import { sanitizeDiscountValue } from "@/lib/partner-offer";
import type { PartnerGalleryDraftItem } from "@/components/partners/PartnerGalleryUploadGrid";
import { DEFAULT_GALLERY_CROP } from "@/lib/partner-gallery-crop";

export const VAULT_DROP_SECTION_INTRO =
  "What is The Vault Drop? This tool is designed to help you quickly liquidate deleted SKUs, clear inventory with old packaging, move surplus/overstock items, or run exclusive short-term bulk offers directly to FoodVault members.";

export const VAULT_DROP_REASON_TAGS = [
  "Deleted SKU",
  "Old Packaging",
  "Surplus / Overstock",
  "Limited Time Bulk Offer",
] as const;

export type VaultDropReasonTag = (typeof VAULT_DROP_REASON_TAGS)[number];

export const VAULT_DROP_MIN_DISCOUNT_PERCENT = 30;

export const VAULT_DROP_DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

export type VaultDropDurationDays = (typeof VAULT_DROP_DURATION_OPTIONS)[number];

export const VAULT_DROP_MAX_PRODUCTS = 10;
export const VAULT_DROP_MAX_IMAGES_PER_PRODUCT = 10;
export const VAULT_DROP_MAX_DESCRIPTION_LENGTH = 160;
export const VAULT_DROP_MAX_TITLE_LENGTH = 120;

export type VaultDropProductStored = {
  title: string;
  description: string;
  image_urls: string[];
  original_price: number;
  clearance_price: number;
  discount_percentage: number;
  reason_tag: VaultDropReasonTag;
  direct_store_link: string;
};

export type VaultDropStored = {
  duration_days: VaultDropDurationDays;
  countdown_end_time: string | null;
  products: VaultDropProductStored[];
};

export type VaultDropProductDraft = {
  id: string;
  collapsed: boolean;
  title: string;
  description: string;
  images: PartnerGalleryDraftItem[];
  discountPercent: string;
  originalPrice: string;
  reasonTag: VaultDropReasonTag | "";
  directStoreLink: string;
};

export type VaultDropFormDraft = {
  enabled: boolean;
  durationDays: VaultDropDurationDays;
  products: VaultDropProductDraft[];
};

function createProductId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `vault-drop-product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createVaultDropProductDraft(
  overrides: Partial<VaultDropProductDraft> = {}
): VaultDropProductDraft {
  return {
    id: createProductId(),
    collapsed: false,
    title: "",
    description: "",
    images: [],
    discountPercent: "",
    originalPrice: "",
    reasonTag: "",
    directStoreLink: "",
    ...overrides,
  };
}

export function emptyVaultDropFormDraft(): VaultDropFormDraft {
  return {
    enabled: false,
    durationDays: 3,
    products: [createVaultDropProductDraft()],
  };
}

export function parsePriceInput(value: string): number | null {
  const normalized = value.replace(/[^0-9.]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function sanitizePriceInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function sanitizeVaultDropTitleInput(value: string): string {
  return formatBusinessNameInput(value, VAULT_DROP_MAX_TITLE_LENGTH);
}

export function finalizeVaultDropTitle(value: string): string {
  return formatBusinessNameInput(value, VAULT_DROP_MAX_TITLE_LENGTH);
}

export function sanitizeVaultDropDescription(value: string): string {
  return value.slice(0, VAULT_DROP_MAX_DESCRIPTION_LENGTH);
}

export function finalizeVaultDropDescription(value: string): string {
  const trimmed = sanitizeVaultDropDescription(value.trim());
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function sanitizeVaultDropDiscount(value: string): string {
  return sanitizeDiscountValue(value);
}

export function calculateClearancePrice(
  originalPrice: number,
  discountPercent: number
): number | null {
  if (originalPrice <= 0 || discountPercent <= 0 || discountPercent >= 100) {
    return null;
  }
  return Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100;
}

export function formatCalculatedClearancePrice(
  originalPrice: string,
  discountPercent: string
): string {
  const original = parsePriceInput(originalPrice);
  const discount = Number(sanitizeVaultDropDiscount(discountPercent));
  if (original == null || !Number.isFinite(discount) || discount <= 0) {
    return "";
  }
  const clearance = calculateClearancePrice(original, discount);
  return clearance != null ? clearance.toFixed(2) : "";
}

export function validateVaultDropDiscountInput(value: string): string | null {
  const discount = Number(sanitizeVaultDropDiscount(value));
  if (!Number.isFinite(discount) || discount <= 0) {
    return `Enter a discount of at least ${VAULT_DROP_MIN_DISCOUNT_PERCENT}%.`;
  }
  if (discount < VAULT_DROP_MIN_DISCOUNT_PERCENT) {
    return `Vault Drop requires a minimum ${VAULT_DROP_MIN_DISCOUNT_PERCENT}% discount.`;
  }
  if (discount > 99) {
    return "Discount cannot exceed 99%.";
  }
  return null;
}

export function formatVaultDropDiscountLabel(percent: number): string {
  return `${percent}% OFF`;
}

export function computeCountdownEndTime(durationDays: VaultDropDurationDays): string {
  const end = new Date();
  end.setDate(end.getDate() + durationDays);
  return end.toISOString();
}

export function isVaultDropReasonTag(value: string): value is VaultDropReasonTag {
  return (VAULT_DROP_REASON_TAGS as readonly string[]).includes(value);
}

function parseLegacyVaultDropProduct(record: Record<string, unknown>): VaultDropProductStored | null {
  const reasonTag = typeof record.reason_tag === "string" ? record.reason_tag : "";
  if (!isVaultDropReasonTag(reasonTag)) return null;

  const originalPrice = Number(record.original_price);
  const clearancePrice = Number(record.clearance_price);
  const discountPercentage = Number(record.discount_percentage);
  const imageUrl = typeof record.image_url === "string" ? record.image_url : "";

  if (
    typeof record.title !== "string" ||
    typeof record.description !== "string" ||
    typeof record.direct_store_link !== "string" ||
    !Number.isFinite(originalPrice) ||
    !Number.isFinite(clearancePrice) ||
    !Number.isFinite(discountPercentage) ||
    !imageUrl
  ) {
    return null;
  }

  return {
    title: record.title,
    description: record.description,
    image_urls: [imageUrl],
    original_price: originalPrice,
    clearance_price: clearancePrice,
    discount_percentage: discountPercentage,
    reason_tag: reasonTag,
    direct_store_link: record.direct_store_link,
  };
}

function parseVaultDropProduct(value: unknown): VaultDropProductStored | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const reasonTag = typeof record.reason_tag === "string" ? record.reason_tag : "";
  if (!isVaultDropReasonTag(reasonTag)) return null;

  const originalPrice = Number(record.original_price);
  const clearancePrice = Number(record.clearance_price);
  const discountPercentage = Number(record.discount_percentage);
  const imageUrls = Array.isArray(record.image_urls)
    ? (record.image_urls as unknown[]).filter((url): url is string => typeof url === "string")
    : typeof record.image_url === "string" && record.image_url
      ? [record.image_url]
      : [];

  if (
    typeof record.title !== "string" ||
    typeof record.description !== "string" ||
    typeof record.direct_store_link !== "string" ||
    !Number.isFinite(originalPrice) ||
    !Number.isFinite(clearancePrice) ||
    !Number.isFinite(discountPercentage) ||
    imageUrls.length === 0
  ) {
    return null;
  }

  return {
    title: record.title,
    description: record.description,
    image_urls: imageUrls,
    original_price: originalPrice,
    clearance_price: clearancePrice,
    discount_percentage: discountPercentage,
    reason_tag: reasonTag,
    direct_store_link: record.direct_store_link,
  };
}

export function parseVaultDropStored(value: unknown): VaultDropStored | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  if (Array.isArray(record.products)) {
    const products = record.products
      .map(parseVaultDropProduct)
      .filter((product): product is VaultDropProductStored => product != null);
    if (products.length === 0) return null;

    const durationDays = Number(record.duration_days);
    return {
      duration_days: VAULT_DROP_DURATION_OPTIONS.includes(durationDays as VaultDropDurationDays)
        ? (durationDays as VaultDropDurationDays)
        : 3,
      countdown_end_time:
        typeof record.countdown_end_time === "string" ? record.countdown_end_time : null,
      products,
    };
  }

  const legacyProduct = parseLegacyVaultDropProduct(record);
  if (!legacyProduct) return null;

  return {
    duration_days: 3,
    countdown_end_time:
      typeof record.countdown_end_time === "string" ? record.countdown_end_time : null,
    products: [legacyProduct],
  };
}

function galleryItemsFromStoredUrls(urls: string[]): PartnerGalleryDraftItem[] {
  return urls.map((url) => ({
    croppedFile: new File([], "stored.jpg", { type: "image/jpeg" }),
    previewUrl: url,
    crop: DEFAULT_GALLERY_CROP,
    recropOnly: true,
    existingOriginalUrl: url,
  }));
}

export function vaultDropFormFromStored(stored: VaultDropStored | null): VaultDropFormDraft {
  if (!stored) return emptyVaultDropFormDraft();

  return {
    enabled: true,
    durationDays: stored.duration_days,
    products: stored.products.map((product, index) =>
      createVaultDropProductDraft({
        collapsed: index > 0,
        title: product.title,
        description: product.description,
        images: galleryItemsFromStoredUrls(product.image_urls),
        discountPercent: String(product.discount_percentage),
        originalPrice: String(product.original_price),
        reasonTag: product.reason_tag,
        directStoreLink: product.direct_store_link,
      })
    ),
  };
}

export function vaultDropDraftFromSerializable(
  draft: Partial<VaultDropFormDraft> | undefined
): VaultDropFormDraft {
  if (!draft) return emptyVaultDropFormDraft();

  const durationDays = VAULT_DROP_DURATION_OPTIONS.includes(
    draft.durationDays as VaultDropDurationDays
  )
    ? (draft.durationDays as VaultDropDurationDays)
    : 3;

  const products =
    draft.products?.map((product, index) =>
      createVaultDropProductDraft({
        ...product,
        id: product.id || createProductId(),
        collapsed: product.collapsed ?? index > 0,
        images: (product.images ?? []).map((item) =>
          item
            ? {
                ...item,
                croppedFile: null as unknown as File,
              }
            : null
        ),
        reasonTag:
          product.reasonTag && isVaultDropReasonTag(product.reasonTag) ? product.reasonTag : "",
      })
    ) ?? [createVaultDropProductDraft()];

  return {
    enabled: draft.enabled ?? false,
    durationDays,
    products: products.length > 0 ? products : [createVaultDropProductDraft()],
  };
}

function productHasAnyValue(product: VaultDropProductDraft): boolean {
  return Boolean(
    product.title.trim() ||
      product.description.trim() ||
      product.images.some(Boolean) ||
      product.discountPercent ||
      product.originalPrice ||
      product.reasonTag ||
      product.directStoreLink.trim()
  );
}

export function getVaultDropStartedProducts(
  draft: VaultDropFormDraft
): VaultDropProductDraft[] {
  return draft.products.filter(productHasAnyValue);
}

export type VaultDropValidationResult =
  | { ok: true; stored: VaultDropStored | null }
  | { ok: false; message: string };

function validateVaultDropProduct(
  product: VaultDropProductDraft
): { ok: true; product: VaultDropProductStored } | { ok: false; message: string } | { ok: true; product: null } {
  if (!productHasAnyValue(product)) {
    return { ok: true, product: null };
  }

  if (!product.title.trim()) {
    return { ok: false, message: "Vault Drop offer title is required." };
  }

  if (!product.description.trim()) {
    return { ok: false, message: "Vault Drop description is required." };
  }

  if (!product.images.some(Boolean)) {
    return { ok: false, message: "Add at least one product photo for each Vault Drop item." };
  }

  const originalPrice = parsePriceInput(product.originalPrice);
  if (originalPrice == null) {
    return { ok: false, message: "Enter a valid original price for each Vault Drop item." };
  }

  const discountError = validateVaultDropDiscountInput(product.discountPercent);
  if (discountError) {
    return { ok: false, message: discountError };
  }

  const discountPercentage = Number(sanitizeVaultDropDiscount(product.discountPercent));
  const clearancePrice = calculateClearancePrice(originalPrice, discountPercentage);
  if (clearancePrice == null) {
    return { ok: false, message: "Unable to calculate clearance price." };
  }

  if (!product.reasonTag) {
    return { ok: false, message: "Select a reason for each Vault Drop item." };
  }

  if (!product.directStoreLink.trim()) {
    return { ok: false, message: "Direct store link is required for each Vault Drop item." };
  }

  return {
    ok: true,
    product: {
      title: finalizeVaultDropTitle(product.title),
      description: finalizeVaultDropDescription(product.description),
      image_urls: [],
      original_price: originalPrice,
      clearance_price: clearancePrice,
      discount_percentage: discountPercentage,
      reason_tag: product.reasonTag,
      direct_store_link: product.directStoreLink.trim(),
    },
  };
}

export function validateVaultDropForm(
  draft: VaultDropFormDraft,
  options: { requireComplete?: boolean } = {}
): VaultDropValidationResult {
  if (!draft.enabled) {
    return { ok: true, stored: null };
  }

  const requireComplete = options.requireComplete ?? true;
  const startedProducts = draft.products.filter(productHasAnyValue);

  if (!requireComplete && startedProducts.length === 0) {
    return { ok: true, stored: null };
  }

  if (requireComplete && startedProducts.length === 0) {
    return {
      ok: false,
      message: "Add at least one Vault Drop product or disable The Vault Drop section.",
    };
  }

  const storedProducts: VaultDropProductStored[] = [];

  for (const product of startedProducts) {
    const result = validateVaultDropProduct(product);
    if (!result.ok) {
      return result;
    }
    if (result.product) {
      storedProducts.push(result.product);
    }
  }

  if (storedProducts.length === 0) {
    return { ok: true, stored: null };
  }

  return {
    ok: true,
    stored: {
      duration_days: draft.durationDays,
      countdown_end_time: computeCountdownEndTime(draft.durationDays),
      products: storedProducts,
    },
  };
}

export function formatVaultDropPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export type VaultDropCountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function getVaultDropCountdownParts(endTimeIso: string | null): VaultDropCountdownParts {
  if (!endTimeIso) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const remainingMs = new Date(endTimeIso).getTime() - Date.now();
  if (remainingMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}

export function formatVaultDropCountdown(parts: VaultDropCountdownParts): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(parts.days)}d : ${pad(parts.hours)}h : ${pad(parts.minutes)}m : ${pad(parts.seconds)}s`;
}
