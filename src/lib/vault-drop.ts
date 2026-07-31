export const VAULT_DROP_SECTION_INTRO =
  "What is The Vault Drop? This feature is designed to help you quickly liquidate deleted SKUs, clear inventory with old packaging, move surplus/overstock items, or run exclusive short-term bulk offers directly to FoodVault members.";

export const VAULT_DROP_REASON_TAGS = [
  "Deleted SKU",
  "Old Packaging",
  "Surplus / Overstock",
  "Limited Time Bulk Offer",
] as const;

export type VaultDropReasonTag = (typeof VAULT_DROP_REASON_TAGS)[number];

export const VAULT_DROP_STATUSES = ["draft", "active", "ended"] as const;

export type VaultDropStatus = (typeof VAULT_DROP_STATUSES)[number];

export const VAULT_DROP_MIN_DISCOUNT_PERCENT = 30;

export const VAULT_DROP_DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

export type VaultDropDurationDays = (typeof VAULT_DROP_DURATION_OPTIONS)[number];

export type VaultDropStored = {
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  clearance_price: number;
  discount_percentage: number;
  reason_tag: VaultDropReasonTag;
  direct_store_link: string;
  countdown_end_time: string | null;
  status: VaultDropStatus;
};

export type VaultDropFormDraft = {
  enabled: boolean;
  title: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  originalPrice: string;
  clearancePrice: string;
  reasonTag: VaultDropReasonTag | "";
  directStoreLink: string;
  durationDays: VaultDropDurationDays;
  status: VaultDropStatus;
};

export function emptyVaultDropFormDraft(): VaultDropFormDraft {
  return {
    enabled: false,
    title: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    originalPrice: "",
    clearancePrice: "",
    reasonTag: "",
    directStoreLink: "",
    durationDays: 3,
    status: "draft",
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

export function calculateVaultDropDiscountPercent(
  originalPrice: number,
  clearancePrice: number
): number | null {
  if (originalPrice <= 0 || clearancePrice < 0 || clearancePrice >= originalPrice) {
    return null;
  }

  return Math.round(((originalPrice - clearancePrice) / originalPrice) * 100);
}

export function formatVaultDropDiscountLabel(percent: number): string {
  return `${percent}% OFF`;
}

export function vaultDropDiscountError(
  originalPrice: number | null,
  clearancePrice: number | null
): string | null {
  if (originalPrice == null || clearancePrice == null) {
    return null;
  }

  if (clearancePrice >= originalPrice) {
    return "Clearance price must be lower than the original price.";
  }

  const discount = calculateVaultDropDiscountPercent(originalPrice, clearancePrice);
  if (discount == null) {
    return "Enter valid prices to calculate the discount.";
  }

  if (discount < VAULT_DROP_MIN_DISCOUNT_PERCENT) {
    return `Vault Drop requires a minimum ${VAULT_DROP_MIN_DISCOUNT_PERCENT}% discount (currently ${discount}%).`;
  }

  return null;
}

export function computeCountdownEndTime(durationDays: VaultDropDurationDays): string {
  const end = new Date();
  end.setDate(end.getDate() + durationDays);
  return end.toISOString();
}

export function isVaultDropReasonTag(value: string): value is VaultDropReasonTag {
  return (VAULT_DROP_REASON_TAGS as readonly string[]).includes(value);
}

export function isVaultDropStatus(value: string): value is VaultDropStatus {
  return (VAULT_DROP_STATUSES as readonly string[]).includes(value);
}

export function parseVaultDropStored(value: unknown): VaultDropStored | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const reasonTag = typeof record.reason_tag === "string" ? record.reason_tag : "";
  if (!isVaultDropReasonTag(reasonTag)) return null;

  const status = typeof record.status === "string" ? record.status : "draft";
  if (!isVaultDropStatus(status)) return null;

  const originalPrice = Number(record.original_price);
  const clearancePrice = Number(record.clearance_price);
  const discountPercentage = Number(record.discount_percentage);

  if (
    typeof record.title !== "string" ||
    typeof record.description !== "string" ||
    typeof record.image_url !== "string" ||
    typeof record.direct_store_link !== "string" ||
    !Number.isFinite(originalPrice) ||
    !Number.isFinite(clearancePrice) ||
    !Number.isFinite(discountPercentage)
  ) {
    return null;
  }

  return {
    title: record.title,
    description: record.description,
    image_url: record.image_url,
    original_price: originalPrice,
    clearance_price: clearancePrice,
    discount_percentage: discountPercentage,
    reason_tag: reasonTag,
    direct_store_link: record.direct_store_link,
    countdown_end_time:
      typeof record.countdown_end_time === "string" ? record.countdown_end_time : null,
    status,
  };
}

export function vaultDropFormFromStored(stored: VaultDropStored | null): VaultDropFormDraft {
  if (!stored) return emptyVaultDropFormDraft();

  return {
    enabled: true,
    title: stored.title,
    description: stored.description,
    imageUrl: stored.image_url,
    imageFile: null,
    originalPrice: String(stored.original_price),
    clearancePrice: String(stored.clearance_price),
    reasonTag: stored.reason_tag,
    directStoreLink: stored.direct_store_link,
    durationDays: 3,
    status: stored.status,
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

  return {
    ...emptyVaultDropFormDraft(),
    ...draft,
    imageFile: null,
    durationDays,
    reasonTag:
      draft.reasonTag && isVaultDropReasonTag(draft.reasonTag) ? draft.reasonTag : "",
    status:
      draft.status && isVaultDropStatus(draft.status) ? draft.status : "draft",
  };
}

export type VaultDropValidationResult =
  | { ok: true; stored: VaultDropStored | null }
  | { ok: false; message: string; field?: keyof VaultDropFormDraft };

export function validateVaultDropForm(
  draft: VaultDropFormDraft,
  options: { requireComplete?: boolean } = {}
): VaultDropValidationResult {
  if (!draft.enabled) {
    return { ok: true, stored: null };
  }

  const requireComplete =
    options.requireComplete ?? draft.status === "active";

  const hasAnyValue =
    draft.title.trim() ||
    draft.description.trim() ||
    draft.imageUrl ||
    draft.originalPrice ||
    draft.clearancePrice ||
    draft.reasonTag ||
    draft.directStoreLink.trim();

  if (!requireComplete && !hasAnyValue) {
    return { ok: true, stored: null };
  }

  if (!requireComplete) {
    const originalPrice = parsePriceInput(draft.originalPrice);
    const clearancePrice = parsePriceInput(draft.clearancePrice);
    if (originalPrice != null && clearancePrice != null) {
      const discountError = vaultDropDiscountError(originalPrice, clearancePrice);
      if (discountError) {
        return { ok: false, message: discountError, field: "clearancePrice" };
      }
    }

    const discountPercentage =
      originalPrice != null && clearancePrice != null
        ? calculateVaultDropDiscountPercent(originalPrice, clearancePrice)
        : 0;

    return {
      ok: true,
      stored: {
        title: draft.title.trim(),
        description: draft.description.trim(),
        image_url: draft.imageUrl,
        original_price: originalPrice ?? 0,
        clearance_price: clearancePrice ?? 0,
        discount_percentage: discountPercentage ?? 0,
        reason_tag: draft.reasonTag || "Surplus / Overstock",
        direct_store_link: draft.directStoreLink.trim(),
        countdown_end_time: null,
        status: "draft",
      },
    };
  }

  if (!draft.title.trim()) {
    return { ok: false, message: "Vault Drop title is required.", field: "title" };
  }

  if (!draft.description.trim()) {
    return {
      ok: false,
      message: "Vault Drop description is required.",
      field: "description",
    };
  }

  if (!draft.imageUrl && !draft.imageFile) {
    return {
      ok: false,
      message: "Vault Drop product image is required.",
      field: "imageUrl",
    };
  }

  const originalPrice = parsePriceInput(draft.originalPrice);
  const clearancePrice = parsePriceInput(draft.clearancePrice);

  if (originalPrice == null) {
    return {
      ok: false,
      message: "Enter a valid original price.",
      field: "originalPrice",
    };
  }

  if (clearancePrice == null) {
    return {
      ok: false,
      message: "Enter a valid clearance price.",
      field: "clearancePrice",
    };
  }

  const discountError = vaultDropDiscountError(originalPrice, clearancePrice);
  if (discountError) {
    return { ok: false, message: discountError, field: "clearancePrice" };
  }

  if (!draft.reasonTag) {
    return {
      ok: false,
      message: "Select a reason for this Vault Drop.",
      field: "reasonTag",
    };
  }

  if (!draft.directStoreLink.trim()) {
    return {
      ok: false,
      message: "Direct store link is required.",
      field: "directStoreLink",
    };
  }

  const discountPercentage = calculateVaultDropDiscountPercent(
    originalPrice,
    clearancePrice
  );

  if (discountPercentage == null) {
    return {
      ok: false,
      message: "Unable to calculate Vault Drop discount.",
      field: "clearancePrice",
    };
  }

  let countdownEndTime: string | null = null;
  if (draft.status === "active") {
    countdownEndTime = computeCountdownEndTime(draft.durationDays);
  }

  return {
    ok: true,
    stored: {
      title: draft.title.trim(),
      description: draft.description.trim(),
      image_url: draft.imageUrl,
      original_price: originalPrice,
      clearance_price: clearancePrice,
      discount_percentage: discountPercentage,
      reason_tag: draft.reasonTag,
      direct_store_link: draft.directStoreLink.trim(),
      countdown_end_time: countdownEndTime,
      status: draft.status,
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
