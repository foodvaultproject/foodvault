import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPageSkeleton } from "@/components/account/AccountSkeletons";
import { MemberOrdersDashboard } from "@/components/account/MemberOrdersDashboard";
import { getMemberVaultMarketOrders, lifetimeMemberSavings } from "@/lib/commerce/member-orders";
import { requireAuthenticatedMember } from "@/lib/member/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Vault Market order history, tracking, and lifetime member savings.",
};

async function OrdersContent() {
  const member = await requireAuthenticatedMember();
  const orders = await getMemberVaultMarketOrders(member.id);
  return (
    <MemberOrdersDashboard
      lifetimeSavings={lifetimeMemberSavings(orders)}
      orders={orders}
    />
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<AccountPageSkeleton />}>
      <OrdersContent />
    </Suspense>
  );
}
