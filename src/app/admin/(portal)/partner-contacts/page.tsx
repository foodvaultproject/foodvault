import { PartnerContactsClient } from "@/components/admin/PartnerContactsClient";
import { getPartnerContacts } from "@/lib/admin/queries";

type PartnerContactsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function PartnerContactsPage({ searchParams }: PartnerContactsPageProps) {
  const { q } = await searchParams;
  const contacts = await getPartnerContacts(q);

  return <PartnerContactsClient contacts={contacts} initialSearch={q ?? ""} />;
}
