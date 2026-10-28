import type { Metadata } from "next";
import { HomePageClientRouter } from "@/components/home/HomePageClientRouter";
import { PantryStorefront } from "@/components/pantry/PantryStorefront";
import { getAppMode } from "@/lib/app-mode";
import { getStaticHomepageData } from "@/lib/homepage/static-data";

export const dynamic = "force-dynamic";

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

type StorefrontPageProps = {
  searchParams: Promise<{
    q?: string;
    department?: string;
    subcategory?: string;
    specific?: string;
    deals?: string;
  }>;
};

export default async function HomePage({ searchParams }: StorefrontPageProps) {
  if (getAppMode() === "foodvault") {
    const data = await getStaticHomepageData();
    return <HomePageClientRouter data={data} />;
  }

  const { q, department, subcategory, specific, deals } = await searchParams;

  return (
    <section className="min-w-0 overflow-x-clip bg-page">
      <div className="mx-auto min-w-0 max-w-[1200px] px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-6 md:pb-16 md:pt-8 lg:px-8">
        <PantryStorefront
          query={q ?? ""}
          department={department ?? ""}
          subcategory={subcategory ?? ""}
          specific={specific ?? ""}
          deals={deals === "1"}
        />
      </div>
    </section>
  );
}
