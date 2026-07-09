import { ContactCentreClient } from "@/components/admin/ContactCentreClient";
import { getContactStats, getEnquiries } from "@/lib/admin/queries";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [stats, enquiries] = await Promise.all([getContactStats(), getEnquiries(q)]);

  return <ContactCentreClient stats={stats} enquiries={enquiries} initialSearch={q ?? ""} />;
}
