import { formatCurrency } from "@/lib/locale";

export type MembershipSettings = {
  membershipPriceMonthly: number;
  trialLengthDays: number;
};

export function formatMembershipPrice(amount: number) {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return formatCurrency(amount, {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function formatMembershipPriceMonthly(amount: number) {
  return `${formatMembershipPrice(amount)}/month`;
}

export function formatTrialLengthDays(days: number) {
  return days === 1 ? "1-day" : `${days}-day`;
}

export function formatFreeTrialLabel(days: number) {
  return `${formatTrialLengthDays(days)} free trial`;
}
