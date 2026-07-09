import { AdminAffiliateTransactionsClient } from "@/components/admin/AdminAffiliateTransactionsClient";
import { getAdminAffiliateTransactions } from "@/lib/admin/queries";

export default async function AdminAffiliateTransactionsPage() {
  const { summary, transactions } = await getAdminAffiliateTransactions({});

  return (
    <AdminAffiliateTransactionsClient summary={summary} transactions={transactions} />
  );
}
