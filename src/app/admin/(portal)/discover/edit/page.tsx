import Link from "next/link";
import { ArticleEditorClient } from "@/components/admin/ArticleEditorClient";
import { getArticleById } from "@/lib/admin/queries";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function DiscoverEditPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const article = id ? await getArticleById(id) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/discover" className="text-sm font-semibold text-muted hover:text-primary">
          ← Back to Discover
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {article ? "Edit Article" : "New Article"}
        </h1>
        <p className="mt-1 text-sm text-muted">Create or update Discover content</p>
      </div>
      <ArticleEditorClient article={article} />
    </div>
  );
}
