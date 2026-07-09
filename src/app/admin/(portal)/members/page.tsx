import { MembersClient } from "@/components/admin/MembersClient";
import { getMemberStats, getMembers } from "@/lib/admin/queries";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function MembersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [members, stats] = await Promise.all([getMembers(q), getMemberStats()]);

  return <MembersClient members={members} stats={stats} initialSearch={q ?? ""} />;
}
