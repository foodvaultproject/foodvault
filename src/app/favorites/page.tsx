import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPageSkeleton } from "@/components/account/AccountSkeletons";
import { MemberFavoritesView } from "@/components/favorites/MemberFavoritesView";
import { requireMemberFavoritesAccess } from "@/lib/member/auth";
import { getMemberFavoritePartners } from "@/lib/member/favorites-queries";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved FoodVault partner brands and member offers.",
};

async function FavoritesContent() {
  const member = await requireMemberFavoritesAccess();
  const favorites = await getMemberFavoritePartners(member.id);

  return <MemberFavoritesView initialFavorites={favorites} />;
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<AccountPageSkeleton />}>
      <FavoritesContent />
    </Suspense>
  );
}
