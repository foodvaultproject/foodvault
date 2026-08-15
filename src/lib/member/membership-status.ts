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

/** Trial rows no longer grant member access or trial UX. */
export function isFreeTrialMemberRow(_row: MemberRow | null | undefined): boolean {
  return false;
}

/**
 * Paid / active member for gated UX. Includes:
 * - linked Stripe subscription (including cancel_at_period_end)
 * - active status
 * - cancelled status while renewal_date (period end) is still in the future
 *
 * Trial / trialing / TRIAL never qualify.
 */
export function isActiveMemberRow(row: MemberRow | null | undefined): boolean {
  if (!row) {
    return false;
  }

  if (memberRowHasPaidSubscription(row)) {
    return true;
  }

  const status = row.membership_status ?? row.status;
  if (isTrialingStatus(status)) {
    return false;
  }

  if (status === "active" || status === "ACTIVE") {
    return true;
  }

  if (isCancelledStatus(status) && memberRowHasPaidPeriodRemaining(row)) {
    return true;
  }

  return false;
}
