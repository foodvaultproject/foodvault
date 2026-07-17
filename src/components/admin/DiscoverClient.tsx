"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { StatCard, StatusBadge, formatAdminDate } from "@/components/admin/AdminUi";
import { deleteArticleAction } from "@/lib/admin/actions";
import type { DiscoverArticleRow } from "@/lib/admin/types";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";

const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const;

type Stats = {
  total: number;
  published: number;
  drafts: number;
  views: number;
};

export function DiscoverClient({
  stats,
  articles,
  activeFilter,
}: {
  stats: Stats;
  articles: DiscoverArticleRow[];
  activeFilter: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(article: DiscoverArticleRow) {
    if (
      !confirm(
        `Delete "${article.title}" permanently? This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteArticleAction(article.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{DISCOVER_PAGE_TITLE}</h1>
          <p className="mt-1 text-sm text-muted">Manage articles for the public {DISCOVER_PAGE_TITLE} section</p>
        </div>
        <Link
          href="/admin/discover/edit"
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          New Article
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Articles" value={stats.total.toLocaleString()} />
        <StatCard label="Published" value={stats.published.toLocaleString()} />
        <StatCard label="Drafts" value={stats.drafts.toLocaleString()} />
        <StatCard label="Total Views" value={stats.views.toLocaleString()} />
      </div>

      <div className="flex gap-1 rounded border border-border bg-page p-1 w-fit">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => router.push(`/admin/discover?filter=${filter}`)}
            className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              activeFilter === filter
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {filter === "ALL" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Title</th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted md:table-cell">Category</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted sm:table-cell">Views</th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted lg:table-cell">Updated</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No articles in this view
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{article.title}</p>
                    {article.featured ? (
                      <span className="text-xs text-primary">Featured</span>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">{article.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={article.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-right text-muted sm:table-cell">
                    {article.views.toLocaleString()}
                  </td>
                  <td className="hidden px-4 py-3 text-muted lg:table-cell">
                    {formatAdminDate(article.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/discover/edit?id=${article.id}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(article)}
                        disabled={pending}
                        className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
