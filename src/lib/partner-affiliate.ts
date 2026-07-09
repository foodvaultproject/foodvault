export type AffiliateCookieDurationDays = 7 | 14 | 30 | 60 | 90;

export const MAX_AFFILIATE_COMMISSION_PERCENT = 50;
export const MAX_AFFILIATE_DESCRIPTION_LENGTH = 300;
export const MAX_AFFILIATE_TERMS_LENGTH = 1000;
export const DEFAULT_AFFILIATE_COOKIE_DURATION: AffiliateCookieDurationDays = 30;

export const AFFILIATE_COOKIE_DURATION_OPTIONS: {
  value: AffiliateCookieDurationDays;
  label: string;
}[] = [
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 30, label: "30 Days" },
  { value: 60, label: "60 Days" },
  { value: 90, label: "90 Days" },
];

export type AffiliateProgramConfig = {
  enabled: boolean;
  commissionPercent: string;
  cookieDurationDays: AffiliateCookieDurationDays;
  programDescription: string;
  affiliateTerms: string;
};

export type AffiliateValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function defaultAffiliateProgramConfig(): AffiliateProgramConfig {
  return {
    enabled: false,
    commissionPercent: "",
    cookieDurationDays: DEFAULT_AFFILIATE_COOKIE_DURATION,
    programDescription: "",
    affiliateTerms: "",
  };
}

export function sanitizeAffiliateCommissionValue(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 2);
}

export function parseAffiliateCookieDuration(
  value: unknown
): AffiliateCookieDurationDays {
  const numeric = Number(value);
  if (numeric === 7 || numeric === 14 || numeric === 60 || numeric === 90) {
    return numeric;
  }
  return DEFAULT_AFFILIATE_COOKIE_DURATION;
}

export function affiliateProgramFromRecord(
  row: Record<string, unknown>
): AffiliateProgramConfig {
  const enabled = Boolean(row.affiliate_enabled);
  const commission =
    row.affiliate_commission_percent != null
      ? String(row.affiliate_commission_percent)
      : "";

  return {
    enabled,
    commissionPercent: commission,
    cookieDurationDays: parseAffiliateCookieDuration(
      row.affiliate_cookie_duration_days
    ),
    programDescription:
      typeof row.affiliate_program_description === "string"
        ? row.affiliate_program_description
        : "",
    affiliateTerms:
      typeof row.affiliate_terms === "string" ? row.affiliate_terms : "",
  };
}

export function validateAffiliateProgram(
  config: AffiliateProgramConfig
): AffiliateValidationResult {
  if (!config.enabled) {
    return { ok: true };
  }

  const commission = Number(sanitizeAffiliateCommissionValue(config.commissionPercent));
  if (!commission || commission < 1 || commission > MAX_AFFILIATE_COMMISSION_PERCENT) {
    return {
      ok: false,
      message: `Enter a commission percentage between 1 and ${MAX_AFFILIATE_COMMISSION_PERCENT}.`,
    };
  }

  const validDurations = AFFILIATE_COOKIE_DURATION_OPTIONS.map((option) => option.value);
  if (!validDurations.includes(config.cookieDurationDays)) {
    return { ok: false, message: "Select a cookie duration." };
  }

  if (config.programDescription.trim().length > MAX_AFFILIATE_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      message: `Program description must be ${MAX_AFFILIATE_DESCRIPTION_LENGTH} characters or fewer.`,
    };
  }

  if (config.affiliateTerms.trim().length > MAX_AFFILIATE_TERMS_LENGTH) {
    return {
      ok: false,
      message: `Affiliate terms must be ${MAX_AFFILIATE_TERMS_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true };
}

export function buildAffiliateStoragePayload(
  config: AffiliateProgramConfig,
  existingCreatedAt: string | null
): Record<string, unknown> {
  const now = new Date().toISOString();
  const description = config.programDescription.trim() || null;
  const terms = config.affiliateTerms.trim() || null;

  if (!config.enabled) {
    return {
      affiliate_enabled: false,
      affiliate_commission_percent: null,
      affiliate_cookie_duration_days: null,
      affiliate_program_description: description,
      affiliate_terms: terms,
      affiliate_updated_at: existingCreatedAt ? now : null,
    };
  }

  const commission = Number(sanitizeAffiliateCommissionValue(config.commissionPercent));

  return {
    affiliate_enabled: true,
    affiliate_commission_percent: commission,
    affiliate_cookie_duration_days: config.cookieDurationDays,
    affiliate_program_description: description,
    affiliate_terms: terms,
    affiliate_created_at: existingCreatedAt ?? now,
    affiliate_updated_at: now,
  };
}
