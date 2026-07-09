import { AdminAffiliateAnalyticsClient } from "@/components/admin/AdminAffiliateAnalyticsClient";
import { getAdminAffiliateAnalytics } from "@/lib/admin/queries";

export default async function AdminAffiliateAnalyticsPage() {
  const analytics = await getAdminAffiliateAnalytics();

  return <AdminAffiliateAnalyticsClient analytics={analytics} />;
}
