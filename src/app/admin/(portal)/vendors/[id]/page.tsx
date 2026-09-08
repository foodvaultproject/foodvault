import Link from "next/link";
import { notFound } from "next/navigation";
import { VendorDetailClient } from "@/components/admin/wms/VendorDetailClient";
import { getVendor, listAssignableProducts, listVendorProducts } from "@/lib/admin/wms";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminVendorDetailPage({ params }: Props) {
  const { id } = await params;
  const vendor = await getVendor(id);
  if (!vendor) notFound();

  const [products, assignable] = await Promise.all([
    listVendorProducts(vendor.id),
    listAssignableProducts(),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/admin/vendors" className="text-sm font-semibold text-muted hover:text-primary">
        ← Back to vendors
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {vendor.paymentTerms ? `Payment terms: ${vendor.paymentTerms}` : "No payment terms set"}
        </p>
      </div>
      <VendorDetailClient vendor={vendor} products={products} assignable={assignable} />
    </div>
  );
}
