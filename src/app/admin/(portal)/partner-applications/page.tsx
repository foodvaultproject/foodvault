import { PartnerApplicationsClient } from "@/components/admin/PartnerApplicationsClient";
import { getApplicationStats, getPendingApplications } from "@/lib/admin/queries";

export default async function PartnerApplicationsPage() {
  const [stats, applications] = await Promise.all([getApplicationStats(), getPendingApplications()]);

  return (
    <PartnerApplicationsClient stats={stats} applications={applications} />
  );
}
