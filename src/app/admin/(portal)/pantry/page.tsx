import Link from "next/link";
import { StatCard } from "@/components/admin/AdminUi";
import { getPantryReportData, listAdminProducts, listInventoryBatches } from "@/lib/admin/pantry";

export default async function AdminPantryHubPage() {
  const [products, batches, reports] = await Promise.all([
    listAdminProducts(),
    listInventoryBatches(),
    getPantryReportData(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vault Market</h1>
        <p className="mt-1 text-sm text-muted">
          Product upload, batch inventory, and stock reporting for the pantry storefront.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Catalog SKUs" value={products.length} />
        <StatCard label="Inventory batches" value={batches.length} />
        <StatCard label="Slow-moving SKUs" value={reports.slowMoving.length} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/products"
          className="rounded border border-border bg-white p-5 transition-colors hover:border-primary"
        >
          <p className="text-sm font-bold text-foreground">Products</p>
          <p className="mt-1 text-sm text-muted">Create and edit PDP attributes, pricing, and NIP data.</p>
        </Link>
        <Link
          href="/admin/inventory"
          className="rounded border border-border bg-white p-5 transition-colors hover:border-primary"
        >
          <p className="text-sm font-bold text-foreground">Inventory</p>
          <p className="mt-1 text-sm text-muted">Log incoming batches, unit cost, and expiry dates.</p>
        </Link>
        <Link
          href="/admin/pantry/reports"
          className="rounded border border-border bg-white p-5 transition-colors hover:border-primary"
        >
          <p className="text-sm font-bold text-foreground">Reports</p>
          <p className="mt-1 text-sm text-muted">SOH valuation, slow movers, and expiry warnings.</p>
        </Link>
      </div>
    </div>
  );
}
