import Link from "next/link";
import { VendorForm } from "@/components/admin/wms/VendorForm";

export default function AdminNewVendorPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/vendors" className="text-sm font-semibold text-muted hover:text-primary">
        ← Back to vendors
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-foreground">New vendor</h1>
        <p className="mt-1 text-sm text-muted">Supplier details and payment terms for procurement.</p>
      </div>
      <VendorForm />
    </div>
  );
}
