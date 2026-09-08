import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPageSkeleton } from "@/components/account/AccountSkeletons";
import { MemberProfileForm } from "@/components/account/MemberProfileForm";
import { getMemberVaultMarketOrders, lifetimeMemberSavings } from "@/lib/commerce/member-orders";
import { requireAuthenticatedMember } from "@/lib/member/auth";
import { getMemberProfile } from "@/lib/member/queries";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your FoodVault personal information and security settings.",
};

async function AccountContent() {
  const member = await requireAuthenticatedMember();
  const [profile, pantryOrders] = await Promise.all([
    getMemberProfile(member.id),
    getMemberVaultMarketOrders(member.id),
  ]);

  return (
    <MemberProfileForm
      profile={
        profile ?? {
          firstName: "Member",
          lastName: "",
          email: member.email,
          country: "New Zealand",
        }
      }
      lifetimeSavings={lifetimeMemberSavings(pantryOrders)}
    />
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageSkeleton />}>
      <AccountContent />
    </Suspense>
  );
}
