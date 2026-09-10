import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PantryProductDetail } from "@/components/pantry/PantryProductDetail";
import {
  catalogSlug,
  findCatalogProduct,
  resolveProductDepartment,
  resolveProductSlug,
  resolveProductSubcategory,
} from "@/lib/commerce/catalog";
import { getActiveVaultMarketProducts, getVaultMarketProductById } from "@/lib/commerce/products";
import { PAGE_PY } from "@/lib/section-spacing";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { category, subcategory, slug } = await params;
  const products = await getActiveVaultMarketProducts();
  const product = findCatalogProduct(products, { category, subcategory, slug });

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: `${product.name} | Vault Market`,
    description:
      product.description ??
      `Buy ${product.name} from ${product.brand} at FoodVault member pricing.`,
  };
}

export async function generateStaticParams() {
  const products = await getActiveVaultMarketProducts();
  return products.map((product) => ({
    category: catalogSlug(resolveProductDepartment(product)),
    subcategory: catalogSlug(resolveProductSubcategory(product)),
    slug: resolveProductSlug(product),
  }));
}

export default async function PantryProductPage({ params }: ProductPageProps) {
  const { category, subcategory, slug } = await params;
  const products = await getActiveVaultMarketProducts();
  const listed = findCatalogProduct(products, { category, subcategory, slug });
  if (!listed) notFound();
  const product = (await getVaultMarketProductById(listed.id)) ?? listed;

  return (
    <section className="min-w-0 overflow-x-clip bg-page">
      <div className={`mx-auto min-w-0 max-w-[1200px] px-4 sm:px-6 lg:px-8 ${PAGE_PY}`}>
        <PantryProductDetail product={product} />
      </div>
    </section>
  );
}
