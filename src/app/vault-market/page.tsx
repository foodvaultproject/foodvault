import type { Metadata } from "next";
import { HomePageClientRouter } from "@/components/home/HomePageClientRouter";
import { getStaticHomepageData } from "@/lib/homepage/static-data";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: {
    absolute: "Vault Market | Direct Partner Directory & In-Store Deals",
  },
  description:
    "Browse FoodVault partner brands, local venue discounts, and direct-to-consumer offers across New Zealand.",
};

export default async function VaultMarketDirectoryPage() {
  const data = await getStaticHomepageData();

  return <HomePageClientRouter data={data} />;
}
