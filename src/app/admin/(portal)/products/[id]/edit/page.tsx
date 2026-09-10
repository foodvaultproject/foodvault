import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditorForm } from "@/components/admin/pantry/ProductEditorForm";
import { getAdminProductById, listAdminProductsByFamilyId } from "@/lib/admin/pantry";
import { listVendors } from "@/lib/admin/wms";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, vendors] = await Promise.all([getAdminProductById(id), listVendors()]);
  if (!product) notFound();

  const siblings = product.product_family_id
    ? await listAdminProductsByFamilyId(product.product_family_id)
    : [];
  const familyProducts = [
    product,
    ...siblings.filter((sibling) => sibling.id !== product.id),
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-sm font-semibold text-muted hover:text-primary">
        ← Back to products
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit product</h1>
        <p className="mt-1 text-sm text-muted">
          {product.sku}. Add flavour variants here — each is saved as its own product and shares this family&apos;s pricing.
        </p>
      </div>
      <ProductEditorForm
        product={product}
        familyProducts={familyProducts}
        vendors={vendors.map((vendor) => ({ id: vendor.id, name: vendor.name }))}
      />
    </div>
  );
}
