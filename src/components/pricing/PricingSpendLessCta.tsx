"use client";

import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";

export function PricingSpendLessCta() {
  return (
    <MemberSignupCtaLink
      variant="start-saving-now"
      className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
    >
      Start Membership Now
    </MemberSignupCtaLink>
  );
}
