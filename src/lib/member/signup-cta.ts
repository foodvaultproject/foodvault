import { SIGNUP_PATH } from "@/lib/auth";
import { SIGNUP_MEMBERSHIP_PATH } from "@/lib/member/paths";

export type MemberSignupCtaVariant =
  | "start-free-trial"
  | "start-free-trial-nav"
  | "start-saving-now";

export const MEMBER_SIGNUP_CTA_LABELS: Record<MemberSignupCtaVariant, string> = {
  "start-free-trial": "Start Free Trial",
  "start-free-trial-nav": "Start FREE Trial",
  "start-saving-now": "Start Saving Now",
};

export const UPGRADE_NOW_LABEL = "Upgrade Now";

export function resolveMemberSignupCta(
  variant: MemberSignupCtaVariant,
  isFreeTrial: boolean
): { label: string; href: string } {
  if (isFreeTrial) {
    return {
      label: UPGRADE_NOW_LABEL,
      href: SIGNUP_MEMBERSHIP_PATH,
    };
  }

  return {
    label: MEMBER_SIGNUP_CTA_LABELS[variant],
    href: SIGNUP_PATH,
  };
}
