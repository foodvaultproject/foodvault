import { ProductsListClient } from "@/components/admin/pantry/ProductsListClient";
import { listAdminProducts } from "@/lib/admin/pantry";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();
  return <ProductsListClient products={products} />;
}
