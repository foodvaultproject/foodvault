import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { AccountPageSkeleton } from "@/components/account/AccountSkeletons";
import { MemberProfileForm } from "@/components/account/MemberProfileForm";
import { getAppMode } from "@/lib/app-mode";
import { getMemberVaultMarketOrders, lifetimeMemberSavings } from "@/lib/commerce/member-orders";
import { requireAuthenticatedMember } from "@/lib/member/auth";
import { getMemberProfile } from "@/lib/member/queries";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const stockup =
    getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup";
  return {
    title: "My Account",
    description: stockup
      ? "Manage your StockUp account, orders, and sign-in details."
      : "Manage your FoodVault personal information and security settings.",
  };
}

async function AccountContent() {
  const headerStore = await headers();
  const stockup =
    getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup";
  const member = await requireAuthenticatedMember();
  const [profile, pantryOrders] = await Promise.all([
    getMemberProfile(member.id),
    getMemberVaultMarketOrders(member.id),
  ]);

  return (
    <MemberProfileForm
      stockup={stockup}
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
