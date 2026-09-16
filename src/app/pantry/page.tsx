import type { Metadata } from "next";
import { PantryStorefront } from "@/components/pantry/PantryStorefront";
import { PAGE_PY } from "@/lib/section-spacing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vault Market",
  description:
    "Shop imported pantry staples directly from FoodVault. Members pay a highlighted member price on condiments, biscuits, tea, and more.",
};

type PantryPageProps = {
  searchParams: Promise<{
    q?: string;
    department?: string;
    subcategory?: string;
    specific?: string;
  }>;
};

export default async function PantryPage({ searchParams }: PantryPageProps) {
  const { q, department, subcategory, specific } = await searchParams;

  return (
    <section className="min-w-0 overflow-x-clip bg-page">
      <div className={`mx-auto min-w-0 max-w-[1200px] px-4 sm:px-6 lg:px-8 ${PAGE_PY}`}>
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
