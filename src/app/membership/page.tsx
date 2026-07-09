import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipPageSkeleton } from "@/components/account/AccountSkeletons";
import { MemberMembershipView } from "@/components/account/MemberMembershipView";
import { requireAuthenticatedMember } from "@/lib/member/auth";
import { getMemberTrialBanner, getMembershipRecord } from "@/lib/member/queries";
import { getMembershipSettings } from "@/lib/member/settings";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { reconcileMemberSubscription } from "@/lib/payment-service/providers/stripe-member";

export const metadata: Metadata = {
  title: "Membership",
  description: "Manage your FoodVault membership, billing, and subscription.",
};

async function MembershipContent() {
  const member = await requireAuthenticatedMember();

  if (getPaymentServiceConfig().isConfigured) {
    await reconcileMemberSubscription(member.id, member.email);
  }

  const [trialBanner, membership, settings] = await Promise.all([
    getMemberTrialBanner(member.id),
    getMembershipRecord(member.id),
    getMembershipSettings(),
  ]);

  return (
    <MemberMembershipView
      trialBanner={trialBanner}
      membership={membership}
      settings={settings}
    />
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={<MembershipPageSkeleton />}>
      <MembershipContent />
    </Suspense>
  );
}
