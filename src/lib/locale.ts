import { DEFAULT_MEMBERSHIP_PRICE_MONTHLY } from "@/lib/system-settings";

export const locale = {
  country: "New Zealand",
  countryCode: "NZ",
  currency: "NZD",
  localeTag: "en-NZ",
} as const;

export const MEMBERSHIP_PRICE_NZD = DEFAULT_MEMBERSHIP_PRICE_MONTHLY;

export function formatCurrency(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  return new Intl.NumberFormat(locale.localeTag, {
    style: "currency",
    currency: locale.currency,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(amount);
}

/** Static fallback only — use getMembershipSettings() for live platform pricing. */
export const membershipPriceMonthly = `${formatCurrency(MEMBERSHIP_PRICE_NZD)}/month`;
