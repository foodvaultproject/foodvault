import { SIGNUP_PATH } from "@/lib/auth";
import { MEMBER_DASHBOARD_PATH, SIGNUP_MEMBERSHIP_PATH } from "@/lib/member/paths";

export type MemberSignupCtaVariant =
  | "unlock-discounts"
  | "unlock-discounts-nav"
  | "start-saving-now";

export const MEMBER_SIGNUP_CTA_LABELS: Record<MemberSignupCtaVariant, string> = {
  "unlock-discounts": "Unlock Discounts",
  "unlock-discounts-nav": "Unlock Discounts",
  "start-saving-now": "Start Saving Now",
};

export const DASHBOARD_CTA_LABEL = "Dashboard";

export function resolveMemberSignupCta(
  variant: MemberSignupCtaVariant,
  options: { isActiveMember: boolean; isMember?: boolean }
): { label: string; href: string } {
  if (options.isActiveMember) {
    return {
      label: DASHBOARD_CTA_LABEL,
      href: MEMBER_DASHBOARD_PATH,
    };
  }

  if (options.isMember) {
    return {
      label: MEMBER_SIGNUP_CTA_LABELS[variant],
      href: SIGNUP_MEMBERSHIP_PATH,
    };
  }

  return {
    label: MEMBER_SIGNUP_CTA_LABELS[variant],
    href: SIGNUP_PATH,
  };
}
