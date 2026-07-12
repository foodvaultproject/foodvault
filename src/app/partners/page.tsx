import type { Metadata } from "next";
import { OurPartnersView } from "@/components/partners/OurPartnersView";
import { getActiveMemberView } from "@/lib/member/active-member";
import { searchPublicBrands } from "@/lib/member/browse-brands";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Partners | FoodVault",
  description:
    "Browse the New Zealand brands participating in FoodVault and offering exclusive member discounts.",
};

export default async function OurPartnersPage() {
  const [{ isActiveMember }, result] = await Promise.all([
    getActiveMemberView(),
    searchPublicBrands({
      sort: "alphabetical",
      limit: 200,
      offset: 0,
    }),
  ]);

  const partners = result.brands.map((brand) => ({
    id: brand.id,
    businessName: brand.businessName,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    logoOriginalUrl: brand.logoOriginalUrl,
    logoCrop: brand.logoCrop,
  }));

  return <OurPartnersView partners={partners} isActiveMember={isActiveMember} />;
}
