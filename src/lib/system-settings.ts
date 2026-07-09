export const DEFAULT_PLATFORM_NAME = "FoodVault";
export const DEFAULT_MEMBERSHIP_PRICE_MONTHLY = 20;
export const DEFAULT_TRIAL_LENGTH_DAYS = 7;
export const DEFAULT_SUPPORT_EMAIL = "support@foodvault.co.nz";
export const DEFAULT_HOMEPAGE_HEADLINE =
  "Save More On The Food And Brands You Already Buy";
export const DEFAULT_HOMEPAGE_SUBHEADING =
  "FoodVault connects New Zealand members with independent food, beverage and household brands offering exclusive member pricing.";

export type SystemSettingsRow = {
  platform_name?: string | null;
  membership_price_monthly?: number | string | null;
  trial_length_days?: number | string | null;
  support_email?: string | null;
  homepage_headline?: string | null;
  homepage_subheading?: string | null;
};

export type ParsedSystemSettings = {
  platform_name: string;
  membership_price_monthly: number;
  trial_length_days: number;
  support_email: string;
  homepage_headline: string;
  homepage_subheading: string;
};

export function parseSettingNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseSettingText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

export function parseSystemSettingsRow(
  row: SystemSettingsRow | null | undefined
): ParsedSystemSettings {
  return {
    platform_name: parseSettingText(row?.platform_name, DEFAULT_PLATFORM_NAME),
    membership_price_monthly: parseSettingNumber(
      row?.membership_price_monthly,
      DEFAULT_MEMBERSHIP_PRICE_MONTHLY
    ),
    trial_length_days: parseSettingNumber(
      row?.trial_length_days,
      DEFAULT_TRIAL_LENGTH_DAYS
    ),
    support_email: parseSettingText(row?.support_email, DEFAULT_SUPPORT_EMAIL),
    homepage_headline: parseSettingText(
      row?.homepage_headline,
      DEFAULT_HOMEPAGE_HEADLINE
    ),
    homepage_subheading: parseSettingText(
      row?.homepage_subheading,
      DEFAULT_HOMEPAGE_SUBHEADING
    ),
  };
}

export const DEFAULT_SYSTEM_SETTINGS = parseSystemSettingsRow(null);
