import type { MemberRow } from "@/lib/member/member-record";
import { memberRowHasPaidSubscription } from "@/lib/member/member-record";

export function isTrialingStatus(status: string | null | undefined): boolean {
  return status === "trialing" || status === "trial" || status === "TRIAL";
}

export function isFreeTrialMemberRow(row: MemberRow | null | undefined): boolean {
  if (!row) {
    return false;
  }

  if (memberRowHasPaidSubscription(row)) {
    return false;
  }

  return isTrialingStatus(row.membership_status ?? row.status);
}

export function isActiveMemberRow(row: MemberRow | null | undefined): boolean {
  if (!row) {
    return false;
  }

  if (memberRowHasPaidSubscription(row)) {
    return true;
  }

  return (row.membership_status ?? row.status) === "active";
}
