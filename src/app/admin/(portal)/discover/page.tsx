import { DiscoverClient } from "@/components/admin/DiscoverClient";
import { getArticles, getDiscoverStats } from "@/lib/admin/queries";
import type { DiscoverSite } from "@/lib/admin/types";
import { getAdminWorkspace } from "@/lib/admin/workspace";

type Props = {
  searchParams: Promise<{ filter?: string; site?: string }>;
};

const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const;
type Filter = (typeof FILTERS)[number];

function parseFilter(value?: string): Filter {
  const upper = value?.toUpperCase();
  return FILTERS.includes(upper as Filter) ? (upper as Filter) : "ALL";
}

function parseSite(value: string | undefined, workspace: DiscoverSite | null): DiscoverSite {
  if (value === "stockup" || value === "foodvault") return value;
  return workspace === "stockup" ? "stockup" : "foodvault";
}

export default async function DiscoverAdminPage({ searchParams }: Props) {
  const { filter: filterParam, site: siteParam } = await searchParams;
  const filter = parseFilter(filterParam);
  const site = parseSite(siteParam, await getAdminWorkspace());
  const [stats, articles] = await Promise.all([
    getDiscoverStats(site),
    getArticles(filter, site),
  ]);

  return <DiscoverClient stats={stats} articles={articles} activeFilter={filter} site={site} />;
}
