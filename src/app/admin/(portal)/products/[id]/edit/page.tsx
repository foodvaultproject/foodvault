import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditorForm } from "@/components/admin/pantry/ProductEditorForm";
import { getAdminProductById } from "@/lib/admin/pantry";
import { listVendors } from "@/lib/admin/wms";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, vendors] = await Promise.all([getAdminProductById(id), listVendors()]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-sm font-semibold text-muted hover:text-primary">
        ← Back to products
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit product</h1>
        <p className="mt-1 text-sm text-muted">{product.sku}</p>
      </div>
      <ProductEditorForm product={product} vendors={vendors.map((vendor) => ({ id: vendor.id, name: vendor.name }))} />
    </div>
  );
}
