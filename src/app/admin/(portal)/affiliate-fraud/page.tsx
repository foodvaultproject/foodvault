import { AdminAffiliateFraudReviewClient } from "@/components/admin/AdminAffiliateFraudReviewClient";
import { getAdminFraudFlagsForReview } from "@/lib/admin/queries";

export default async function AdminAffiliateFraudReviewPage() {
  const flags = await getAdminFraudFlagsForReview();

  return <AdminAffiliateFraudReviewClient initialFlags={flags} />;
}
