import { DiscoverClient } from "@/components/admin/DiscoverClient";
import { getArticles, getDiscoverStats } from "@/lib/admin/queries";

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const;
type Filter = (typeof FILTERS)[number];

function parseFilter(value?: string): Filter {
  const upper = value?.toUpperCase();
  return FILTERS.includes(upper as Filter) ? (upper as Filter) : "ALL";
}

export default async function DiscoverPage({ searchParams }: Props) {
  const { filter: filterParam } = await searchParams;
  const filter = parseFilter(filterParam);
  const [stats, articles] = await Promise.all([getDiscoverStats(), getArticles(filter)]);

  return <DiscoverClient stats={stats} articles={articles} activeFilter={filter} />;
}
