import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverSection } from "@/components/home/DiscoverSection";
import { HomePageClientRouter } from "@/components/home/HomePageClientRouter";
import { StockUpCatalog } from "@/components/pantry/PantryStorefront";
import { getAppMode } from "@/lib/app-mode";
import { getDiscoverPageContent } from "@/lib/discover/queries";
import { getStaticHomepageData } from "@/lib/homepage/static-data";

export const revalidate = 3600;

const stockup = getAppMode() === "stockup";

export const metadata: Metadata = stockup
  ? {
      metadataBase: new URL("https://www.stockup.co.nz"),
      title: {
        absolute: "StockUp | Direct Supermarket Delivery",
      },
      description:
        "Shop StockUp for direct supermarket delivery. Saver pricing on everyday groceries, shipped across New Zealand.",
    }
  : {
      metadataBase: new URL("https://www.foodvault.co.nz"),
      title: {
        absolute: "FoodVault | Kiwi Brand Directory & Local Perks",
      },
      description:
        "Browse Kiwi partner brands, in-store offers, and local perks across New Zealand.",
    };

export default async function HomePage() {
  if (getAppMode() === "foodvault") {
    const data = await getStaticHomepageData();
    return <HomePageClientRouter data={data} />;
  }

  const guides = (await getDiscoverPageContent("stockup")).homepageCards;

  return (
    <section className="min-w-0 overflow-x-clip bg-page">
      <Suspense fallback={null}>
        <StockUpCatalog>
          <DiscoverSection articles={guides} stockup />
        </StockUpCatalog>
      </Suspense>
    </section>
  );
}
