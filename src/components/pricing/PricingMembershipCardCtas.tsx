"use client";

import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { useIsFreeTrialMember } from "@/components/member/MemberSignupCtaProvider";

type PricingMembershipCardCtasProps = {
  trialLengthDays: number;
};

export function PricingMembershipCardCtas({
  trialLengthDays,
}: PricingMembershipCardCtasProps) {
  const isFreeTrial = useIsFreeTrialMember();

  return (
    <div className="mt-8 space-y-3">
      <Link
        href="/signup"
        className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
      >
        Start Membership
      </Link>
      {!isFreeTrial && (
        <>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            or
          </p>
          <MemberSignupCtaLink
            variant="start-free-trial"
            className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
          />
          <p className="text-center text-xs text-muted-foreground">
            {trialLengthDays}-day free trial · No payment card required
          </p>
        </>
      )}
    </div>
  );
}
