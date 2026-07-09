import { AdminAffiliateSystemHealthClient } from "@/components/admin/AdminAffiliateSystemHealthClient";
import { mapPlatformHealth } from "@/lib/admin/platform-health";
import { getPlatformHealthDashboard } from "@/lib/admin/queries";

const EMPTY_DASHBOARD = mapPlatformHealth({});

export default async function AdminAffiliateSystemHealthPage() {
  const raw = await getPlatformHealthDashboard();
  const dashboard = raw ? mapPlatformHealth(raw) : EMPTY_DASHBOARD;

  return <AdminAffiliateSystemHealthClient dashboard={dashboard} />;
}
