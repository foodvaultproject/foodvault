import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/AccountSkeletons";
import { MemberDashboard } from "@/components/account/MemberDashboard";
import { getRecentBrandCards } from "@/lib/member/browse-brands";
import { requireAuthenticatedMember } from "@/lib/member/auth";
import { getMemberFavoritePartners } from "@/lib/member/favorites-queries";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";
import { getMemberVaultMarketOrders, lifetimeMemberSavings } from "@/lib/commerce/member-orders";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { reconcileMemberSubscription } from "@/lib/payment-service/providers/stripe-member";

export const metadata: Metadata = {
  title: "My Dashboard",
  description:
    "Your FoodVault member dashboard for quick actions, favourites, and recently added brands.",
};

async function DashboardContent() {
  const member = await requireAuthenticatedMember();
  let error: string | null = null;
  let brands: Awaited<ReturnType<typeof getRecentBrandCards>> = [];
  let favorites: Awaited<ReturnType<typeof getMemberFavoritePartners>> = [];
  let canFavorite = false;
  let favoritedPartnerIds: string[] = [];
  let lifetimeSavings = 0;

  try {
    if (getPaymentServiceConfig().isConfigured) {
      await reconcileMemberSubscription(member.id, member.email);
    }

    const [recentBrands, memberFavorites, favoriteContext, pantryOrders] =
      await Promise.all([
        getRecentBrandCards(),
        getMemberFavoritePartners(member.id),
        getViewerFavoriteContext(),
        getMemberVaultMarketOrders(member.id),
      ]);
    brands = recentBrands;
    favorites = memberFavorites;
    canFavorite = favoriteContext.canFavorite;
    favoritedPartnerIds = favoriteContext.favoritedPartnerIds;
    lifetimeSavings = lifetimeMemberSavings(pantryOrders);
  } catch (loadError) {
    error =
      loadError instanceof Error
        ? loadError.message
        : "Unable to load your dashboard right now.";
  }

  return (
    <MemberDashboard
      brands={brands}
      favorites={favorites}
      canFavorite={canFavorite}
      favoritedPartnerIds={favoritedPartnerIds}
      lifetimeSavings={lifetimeSavings}
      error={error}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
