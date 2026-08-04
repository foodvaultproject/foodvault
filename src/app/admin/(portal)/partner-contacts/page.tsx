import { PartnerContactsClient } from "@/components/admin/PartnerContactsClient";
import { parsePartnerContactFilters } from "@/lib/admin/partner-contacts-filters";
import { getPartnerContacts } from "@/lib/admin/queries";

type PartnerContactsPageProps = {
  searchParams: Promise<{
    business?: string;
    contact?: string;
    email?: string;
    phone?: string;
    status?: string;
  }>;
};

export default async function PartnerContactsPage({ searchParams }: PartnerContactsPageProps) {
  const params = await searchParams;
  const filters = parsePartnerContactFilters(params);
  const contacts = await getPartnerContacts(filters);

  return <PartnerContactsClient contacts={contacts} initialFilters={filters} />;
}
