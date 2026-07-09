import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/AccountSkeletons";
import { MemberDashboard } from "@/components/account/MemberDashboard";
import { getRecentBrandCards } from "@/lib/member/browse-brands";
import { requireAuthenticatedMember } from "@/lib/member/auth";
import { getMemberTrialBanner } from "@/lib/member/queries";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { reconcileMemberSubscription } from "@/lib/payment-service/providers/stripe-member";

export const metadata: Metadata = {
  title: "My Dashboard",
  description:
    "Your FoodVault member dashboard for trial status, quick actions, and recently added brands.",
};

async function DashboardContent() {
  const member = await requireAuthenticatedMember();
  let error: string | null = null;
  let trialBanner = null;
  let brands: Awaited<ReturnType<typeof getRecentBrandCards>> = [];
  let canFavorite = false;
  let favoritedPartnerIds: string[] = [];

  try {
    if (getPaymentServiceConfig().isConfigured) {
      await reconcileMemberSubscription(member.id, member.email);
    }

    const [banner, recentBrands, favoriteContext] = await Promise.all([
      getMemberTrialBanner(member.id),
      getRecentBrandCards(),
      getViewerFavoriteContext(),
    ]);
    trialBanner = banner;
    brands = recentBrands;
    canFavorite = favoriteContext.canFavorite;
    favoritedPartnerIds = favoriteContext.favoritedPartnerIds;
  } catch (loadError) {
    error =
      loadError instanceof Error
        ? loadError.message
        : "Unable to load your dashboard right now.";
  }

  return (
    <MemberDashboard
      trialBanner={trialBanner}
      brands={brands}
      canFavorite={canFavorite}
      favoritedPartnerIds={favoritedPartnerIds}
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
