import Link from "next/link";
import { ProductEditorForm } from "@/components/admin/pantry/ProductEditorForm";
import { listVendors } from "@/lib/admin/wms";

export default async function AdminNewProductPage() {
  const vendors = await listVendors();
  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-sm font-semibold text-muted hover:text-primary">
        ← Back to products
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Vault Market product</h1>
        <p className="mt-1 text-sm text-muted">
          Set family pricing and category once, then add flavour variants. Each variant is saved as its own product card.
        </p>
      </div>
      <ProductEditorForm product={null} vendors={vendors.map((vendor) => ({ id: vendor.id, name: vendor.name }))} />
    </div>
  );
}
