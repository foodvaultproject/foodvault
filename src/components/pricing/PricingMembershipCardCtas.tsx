"use client";

import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";

export function PricingMembershipCardCtas() {
  return (
    <div className="mt-8">
      <MemberSignupCtaLink
        variant="unlock-discounts"
        className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
      />
    </div>
  );
}
