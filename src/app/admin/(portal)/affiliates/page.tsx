import { AffiliatesClient } from "@/components/admin/AffiliatesClient";
import {
  getAdminAffiliateBrands,
  getAdminAffiliates,
  getAdminAffiliateStats,
} from "@/lib/admin/queries";

export default async function AdminAffiliatesPage() {
  const [stats, affiliates, brands] = await Promise.all([
    getAdminAffiliateStats(),
    getAdminAffiliates(),
    getAdminAffiliateBrands(),
  ]);

  return <AffiliatesClient stats={stats} affiliates={affiliates} brands={brands} />;
}
