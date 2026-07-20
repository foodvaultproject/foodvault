import type { MemberRow } from "@/lib/member/member-record";
import {
  memberRowHasPaidPeriodRemaining,
  memberRowHasPaidSubscription,
} from "@/lib/member/member-record";

export function isTrialingStatus(status: string | null | undefined): boolean {
  return status === "trialing" || status === "trial" || status === "TRIAL";
}

export function isCancelledStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? "").toLowerCase();
  return normalized === "cancelled" || normalized === "canceled";
}

export function isFreeTrialMemberRow(row: MemberRow | null | undefined): boolean {
  if (!row) {
    return false;
  }

  if (memberRowHasPaidSubscription(row)) {
    return false;
  }

  if (memberRowHasPaidPeriodRemaining(row)) {
    return false;
  }

  return isTrialingStatus(row.membership_status ?? row.status);
}

/**
 * Paid / active member for gated UX. Includes:
 * - linked Stripe subscription (including cancel_at_period_end)
 * - active status
 * - cancelled status while renewal_date (period end) is still in the future
 */
export function isActiveMemberRow(row: MemberRow | null | undefined): boolean {
  if (!row) {
    return false;
  }

  if (memberRowHasPaidSubscription(row)) {
    return true;
  }

  const status = row.membership_status ?? row.status;
  if (status === "active" || status === "ACTIVE") {
    return true;
  }

  if (isCancelledStatus(status) && memberRowHasPaidPeriodRemaining(row)) {
    return true;
  }

  return false;
}
