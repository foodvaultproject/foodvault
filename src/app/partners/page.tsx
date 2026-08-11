import type { Metadata } from "next";
import { OurPartnersView } from "@/components/partners/OurPartnersView";
import { getCachedSearchPublicBrands } from "@/lib/cache/public-directory";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Our Partners | FoodVault",
  description:
    "Browse the New Zealand brands participating in FoodVault and offering exclusive member discounts.",
};

export default async function OurPartnersPage() {
  const result = await getCachedSearchPublicBrands({
    sort: "alphabetical",
    limit: 200,
    offset: 0,
  });

  const partners = result.brands.map((brand) => ({
    id: brand.id,
    businessName: brand.businessName,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    logoOriginalUrl: brand.logoOriginalUrl,
    logoCrop: brand.logoCrop,
  }));

  return <OurPartnersView partners={partners} />;
}
