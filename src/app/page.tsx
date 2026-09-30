import type { Metadata } from "next";
import { PantryStorefront } from "@/components/pantry/PantryStorefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "FoodVault | Direct Supermarket Pricing",
  },
  description:
    "Shop the FoodVault supermarket. Everyone gets saver pricing on condiments, biscuits, tea, and more, shipped from our warehouse.",
};

type StorefrontPageProps = {
  searchParams: Promise<{
    q?: string;
    department?: string;
    subcategory?: string;
    specific?: string;
  }>;
};

export default async function StorefrontPage({ searchParams }: StorefrontPageProps) {
  const { q, department, subcategory, specific } = await searchParams;

  return (
    <section className="min-w-0 overflow-x-clip bg-page">
      <div className="mx-auto min-w-0 max-w-[1200px] px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-6 md:pb-16 md:pt-8 lg:px-8">
        <PantryStorefront
          query={q ?? ""}
          department={department ?? ""}
          subcategory={subcategory ?? ""}
          specific={specific ?? ""}
        />
      </div>
    </section>
  );
}
