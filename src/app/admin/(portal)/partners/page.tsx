import { PartnersClient } from "@/components/admin/PartnersClient";
import { getAllPartners } from "@/lib/admin/queries";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function PartnersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const partners = await getAllPartners(q);

  return <PartnersClient partners={partners} initialSearch={q ?? ""} />;
}
