import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PartnerProfileClientHydrator } from "@/components/brands/PartnerProfileClientHydrator";
import { LOGIN_PATH } from "@/lib/auth";
import { getRequestSupabaseSession } from "@/lib/auth/request-session";
import { isPartnerAffiliateProgramPublic } from "@/lib/member/partner-profile";
import { getPartnerOwnProfilePreview } from "@/lib/member/partner-profile";

export const metadata: Metadata = {
  title: "Preview Profile | FoodVault Partner",
  robots: { index: false, follow: false },
};

export default async function PartnerPreviewProfilePage() {
  const { user } = await getRequestSupabaseSession();

  if (!user) {
    redirect(LOGIN_PATH);
  }

  const isPartner =
    user.user_metadata?.account_type === "partner" ||
    user.user_metadata?.partner_account_created === true;

  if (!isPartner) {
    redirect("/");
  }

  const profile = await getPartnerOwnProfilePreview();

  if (!profile) {
    notFound();
  }

  const affiliatePubliclyVisible = await isPartnerAffiliateProgramPublic(profile.id);

  return (
    <PartnerProfileClientHydrator
      profile={profile}
      recommended={[]}
      affiliatePubliclyVisible={affiliatePubliclyVisible}
    />
  );
}
