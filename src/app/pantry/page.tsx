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
  }>;
};

export default async function PantryPage({ searchParams }: PantryPageProps) {
  const { q, department, subcategory } = await searchParams;

  return (
    <section className="bg-page">
      <div className={`mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 ${PAGE_PY}`}>
        <PantryStorefront
          query={q ?? ""}
          department={department ?? ""}
          subcategory={subcategory ?? ""}
        />
      </div>
    </section>
  );
}
