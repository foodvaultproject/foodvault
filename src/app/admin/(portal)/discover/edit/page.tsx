import Link from "next/link";
import { ArticleEditorClient } from "@/components/admin/ArticleEditorClient";
import { getArticleById } from "@/lib/admin/queries";
import type { DiscoverSite } from "@/lib/admin/types";
import { getAdminWorkspace } from "@/lib/admin/workspace";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";
import { getActiveVaultMarketProducts } from "@/lib/commerce/products";

type Props = {
  searchParams: Promise<{ id?: string; site?: string }>;
};

function parseSite(value: string | undefined, workspace: DiscoverSite | null): DiscoverSite {
  if (value === "stockup" || value === "foodvault") return value;
  return workspace === "stockup" ? "stockup" : "foodvault";
}

export default async function DiscoverEditPage({ searchParams }: Props) {
  const { id, site: siteParam } = await searchParams;
  const requestedSite = parseSite(siteParam, await getAdminWorkspace());
  const article = id ? await getArticleById(id, requestedSite) : null;
  const site: DiscoverSite = article?.site === "stockup" || article?.site === "foodvault"
    ? article.site
    : requestedSite;
  const products =
    site === "stockup"
      ? (await getActiveVaultMarketProducts()).map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
        }))
      : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/discover?site=${site}`} className="text-sm font-semibold text-muted hover:text-primary">
          ← Back to {site === "stockup" ? "News & Savings" : DISCOVER_PAGE_TITLE}
        </Link>
        <div className="flex gap-1 rounded border border-border bg-page p-1">
          {(["foodvault", "stockup"] as const).map((value) => (
            <Link
              key={value}
              href={article ? `/admin/discover?site=${value}` : `/admin/discover/edit?site=${value}`}
              className={`rounded px-3 py-1.5 text-xs font-semibold uppercase ${
                site === value ? "bg-white text-primary" : "text-muted"
              }`}
            >
              {value === "stockup" ? "StockUp" : "FoodVault"}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {article ? "Edit Article" : "New Article"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {site === "stockup" ? "StockUp News & Savings" : `FoodVault ${DISCOVER_PAGE_TITLE}`}
        </p>
      </div>
      <ArticleEditorClient article={article} site={site} products={products} />
    </div>
  );
}
