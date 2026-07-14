import {
  getAuthSession,
  isSupabaseConfigured,
  PARTNER_DASHBOARD_PATH,
  PARTNER_LOGIN_PATH,
  signInWithEmail,
  signInWithGoogle,
  type AuthSession,
} from "@/lib/auth";
import { getPartnerRecord } from "@/lib/partner-data";

export const PARTNER_CREATE_ACCOUNT_PATH = "/partner-application/create-account";
export const PARTNER_APPLICATION_PATH = "/partner-application";
export { PARTNER_LOGIN_PATH };
export const PARTNER_APPLICATION_SUBMITTED_PATH = "/partner-application/submitted";

const DRAFT_PREFIX = "foodvault-partner-application-draft";

export type PartnerApplicationDraft = {
  businessName?: string;
  websiteUrl?: string;
  shortDescription?: string;
  brandStory?: string;
  primaryDepartment?: string;
  subcategories?: string[];
  categoryGroups?: import("@/data/partner-categories").PartnerCategoryGroup[];
  offerType?: string;
  discountValue?: string;
  offerScope?: import("@/lib/partner-offer").OfferScope;
  selectedProducts?: import("@/lib/partner-offer").SelectedProductDraft[];
  /** @deprecated Use offerScope */
  offerSummary?: string;
  /** @deprecated Use offerScope */
  offerAppliesTo?: string;
  supportEmail?: string;
  supportPhone?: string;
  contactName?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
  affiliateEnabled?: boolean;
  affiliateCommissionPercent?: string;
  affiliateCookieDurationDays?: import("@/lib/partner-affiliate").AffiliateCookieDurationDays;
  affiliateProgramDescription?: string;
  affiliateTerms?: string;
};

export type PartnerApplicationAssets = {
  bannerUpload?: {
    croppedFile: File;
    originalFile?: File | null;
    crop: import("@/lib/partner-banner-crop").BannerCropSettings;
    recropOnly?: boolean;
    existingOriginalUrl?: string | null;
  } | null;
  /** @deprecated Use bannerUpload with crop metadata instead. */
  bannerFile?: File | null;
  logoFile?: File | null;
  logoOriginalFile?: File | null;
  logoCrop?: import("@/lib/partner-logo-crop").LogoCropSettings | null;
  galleryItems?: {
    croppedFile: File;
    originalFile?: File | null;
    crop: import("@/lib/partner-gallery-crop").GalleryCropSettings;
    recropOnly?: boolean;
    existingOriginalUrl?: string | null;
  }[];
  /** @deprecated Use galleryItems with crop metadata instead. */
  galleryFiles?: File[];
};

export type PartnerSession = {
  id: string;
  email: string;
  isDev?: boolean;
};

function getDraftKey(userId: string) {
  return `${DRAFT_PREFIX}:${userId}`;
}

export function loadPartnerApplicationDraft(userId: string): PartnerApplicationDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getDraftKey(userId));
    return raw ? (JSON.parse(raw) as PartnerApplicationDraft) : null;
  } catch {
    return null;
  }
}

export function savePartnerApplicationDraft(userId: string, draft: PartnerApplicationDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getDraftKey(userId), JSON.stringify(draft));
}

export function clearPartnerApplicationDraft(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getDraftKey(userId));
}

function toPartnerSession(session: AuthSession): PartnerSession {
  return {
    id: session.id,
    email: session.email,
    isDev: session.isDev,
  };
}

export async function getPartnerSession(): Promise<PartnerSession | null> {
  const session = await getAuthSession();
  if (!session || session.accountType !== "partner") {
    return null;
  }

  return toPartnerSession(session);
}

/** Partners without a submitted application should finish `/partner-application`. */
export async function resolvePartnerPostLoginPath(
  userId: string,
  nextPath?: string | null
): Promise<string> {
  const record = await getPartnerRecord(userId);
  if (!record) {
    return PARTNER_APPLICATION_PATH;
  }

  if (nextPath && nextPath.startsWith("/")) {
    return nextPath;
  }

  return PARTNER_DASHBOARD_PATH;
}

export async function createPartnerAccountWithEmail(
  email: string,
  password: string
): Promise<{
  error?: string;
  needsEmailConfirmation?: true;
  email?: string;
  checkEmailPath?: string;
  success?: true;
}> {
  const { createPartnerAccountAction } = await import(
    "@/lib/partner/signup-actions"
  );
  return createPartnerAccountAction(email, password);
}

export async function signInPartnerWithEmail(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const result = await signInWithEmail(email, password, "partner");
  return { error: result.error };
}

export async function signInPartnerWithGoogle() {
  return signInWithGoogle({
    accountType: "partner",
    nextPath: PARTNER_APPLICATION_PATH,
  });
}

export { signOut as signOutPartner } from "@/lib/auth";
