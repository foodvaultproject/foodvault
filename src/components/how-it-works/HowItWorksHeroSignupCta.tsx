"use client";

import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { useIsActiveMember } from "@/components/member/MemberSignupCtaProvider";

export function HowItWorksHeroSignupCta() {
  const isActiveMember = useIsActiveMember();

  if (isActiveMember) {
    return null;
  }

  return (
    <div className="mt-5">
      <MemberSignupCtaLink
        variant="start-free-trial"
        className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-2.5 text-[14px] font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 sm:w-auto"
      />
    </div>
  );
}
