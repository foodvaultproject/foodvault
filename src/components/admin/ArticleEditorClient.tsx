"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArticleHeroUploadField } from "@/components/admin/ArticleHeroUploadField";
import { ArticleMetaTagsField } from "@/components/admin/ArticleMetaTagsField";
import { saveArticleAction } from "@/lib/admin/actions";
import { DISCOVER_CMS_CATEGORIES, slugifyTitle, type DiscoverArticleRow } from "@/lib/admin/types";
import { articleHtmlToPlainText } from "@/lib/discover/article-body";
import { parseMetaTags } from "@/lib/discover/meta-tags";

const inputClass =
  "w-full rounded-md border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

export function ArticleEditorClient({ article }: { article: DiscoverArticleRow | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [heroUrl, setHeroUrl] = useState(article?.hero_image_url ?? "");
  const [metaTags, setMetaTags] = useState<string[]>(parseMetaTags(article?.meta_tags));

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!article) setSlug(slugifyTitle(value));
  }

  function handleSave(publish: boolean) {
    setError(null);
    startTransition(async () => {
      const form = document.getElementById("article-form") as HTMLFormElement;
      const fd = new FormData(form);
      if (heroUrl) fd.set("hero_image_url", heroUrl);
      fd.set("meta_tags", JSON.stringify(metaTags));
      const result = await saveArticleAction(fd, publish);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/discover");
      router.refresh();
    });
  }

  return (
    <div className="rounded border border-border bg-white p-6">
      <form id="article-form" className="space-y-6">
        {article ? <input type="hidden" name="id" value={article.id} /> : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={article?.category ?? DISCOVER_CMS_CATEGORIES[0]} className={inputClass}>
              {DISCOVER_CMS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="publish_date">Publish Date</label>
            <input
              id="publish_date"
              name="publish_date"
              type="datetime-local"
              defaultValue={article?.publish_date ? article.publish_date.slice(0, 16) : ""}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="summary">Summary</label>
          <textarea
            id="summary"
            name="summary"
            rows={2}
            defaultValue={article?.summary ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="body">Body</label>
          <textarea
            id="body"
            name="body"
            rows={10}
            defaultValue={articleHtmlToPlainText(article?.body ?? "")}
            className={`${inputClass} font-mono text-xs`}
          />
        </div>

        <section className="space-y-6 rounded-lg border border-border p-5">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Meta</h3>
            <p className="mt-1 text-xs text-muted">
              SEO fields and article tags for search and the published article footer.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="meta_title">Meta Title</label>
              <input id="meta_title" name="meta_title" defaultValue={article?.meta_title ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="meta_description">Meta Description</label>
              <input id="meta_description" name="meta_description" defaultValue={article?.meta_description ?? ""} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Meta Tags</label>
            <ArticleMetaTagsField tags={metaTags} onChange={setMetaTags} disabled={pending} />
          </div>
        </section>

        <div>
          <label className={labelClass}>Hero Image</label>
          <ArticleHeroUploadField
            heroUrl={heroUrl}
            onChange={setHeroUrl}
            onError={setError}
            disabled={pending}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="featured" defaultChecked={article?.featured ?? false} className="rounded-md border-border text-primary focus:ring-primary" />
          Featured article
        </label>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 flex gap-3 border-t border-border pt-6">
        <button
          type="button"
          disabled={pending}
          onClick={() => handleSave(false)}
          className="rounded border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => handleSave(true)}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
