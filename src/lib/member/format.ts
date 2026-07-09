import { locale } from "@/lib/locale";

export function formatMemberDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(locale.localeTag, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMemberDateShort(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(locale.localeTag, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDaysRemaining(days: number) {
  if (days <= 0) return "0 Days Remaining";
  if (days === 1) return "1 Day Remaining";
  return `${days} Days Remaining`;
}
