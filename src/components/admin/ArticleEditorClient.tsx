"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArticleHeroUploadField } from "@/components/admin/ArticleHeroUploadField";
import { ArticleMetaTagsField } from "@/components/admin/ArticleMetaTagsField";
import {
  ArticleBodyEditor,
  type ArticleBodyEditorHandle,
} from "@/components/admin/ArticleBodyEditor";
import { saveArticleAction } from "@/lib/admin/actions";
import {
  slugifyTitle,
  type DiscoverArticleRow,
  type DiscoverFaq,
  type DiscoverSite,
} from "@/lib/admin/types";
import { categoriesForSite, normalizeDiscoverCategory } from "@/lib/discover/categories";
import { parseDiscoverFaqs, parseMetaTags } from "@/lib/discover/meta-tags";

const inputClass =
  "w-full rounded-md border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

export function ArticleEditorClient({
  article,
  site,
  products = [],
}: {
  article: DiscoverArticleRow | null;
  site: DiscoverSite;
  products?: Array<{ id: string; name: string; brand: string }>;
}) {
  const router = useRouter();
  const bodyEditorRef = useRef<ArticleBodyEditorHandle>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [heroUrl, setHeroUrl] = useState(article?.hero_image_url ?? "");
  const [metaTags, setMetaTags] = useState<string[]>(parseMetaTags(article?.meta_tags));
  const [productQuery, setProductQuery] = useState("");
  const [relatedIds, setRelatedIds] = useState<string[]>(article?.related_product_ids ?? []);
  const [faqs, setFaqs] = useState<DiscoverFaq[]>(parseDiscoverFaqs(article?.faqs));
  const categories = categoriesForSite(site);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!article) setSlug(slugifyTitle(value));
  }

  function handleSave(publish: boolean) {
    setError(null);
    startTransition(async () => {
      const form = document.getElementById("article-form") as HTMLFormElement;
      const fd = new FormData(form);
      const bodyHtml = bodyEditorRef.current?.getHtml() ?? "";
      fd.set("body", bodyHtml);
      if (heroUrl) fd.set("hero_image_url", heroUrl);
      fd.set("meta_tags", JSON.stringify(metaTags));
      fd.set("site", site);
      fd.set("related_product_ids", JSON.stringify(relatedIds));
      fd.set("faqs", JSON.stringify(faqs));
      const result = await saveArticleAction(fd, publish, bodyHtml);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/admin/discover?site=${site}`);
      router.refresh();
    });
  }

  return (
    <div className="rounded border border-border bg-white p-6">
      <form id="article-form" className="space-y-6">
        {article ? <input type="hidden" name="id" value={article.id} /> : null}
        <input type="hidden" name="site" value={site} />

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

        <div className="max-w-md">
          <label className={labelClass} htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            defaultValue={
              (article?.category ? normalizeDiscoverCategory(article.category, site) : null) ??
              categories[0]
            }
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
          <label className={labelClass}>Body</label>
          <ArticleBodyEditor
            ref={bodyEditorRef}
            initialBody={article?.body ?? ""}
            articleTitle={title}
            disabled={pending}
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

        {site === "stockup" ? (
          <section className="space-y-4 rounded-lg border border-border p-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Featured pantry products</h3>
              <input
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="Search active products"
                className={`${inputClass} mt-3`}
              />
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {products
                .filter((product) => {
                  const query = productQuery.trim().toLowerCase();
                  if (!query) return relatedIds.includes(product.id) || products.indexOf(product) < 12;
                  return `${product.name} ${product.brand}`.toLowerCase().includes(query);
                })
                .slice(0, 20)
                .map((product) => (
                  <label key={product.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={relatedIds.includes(product.id)}
                      onChange={() =>
                        setRelatedIds((current) =>
                          current.includes(product.id)
                            ? current.filter((id) => id !== product.id)
                            : [...current, product.id]
                        )
                      }
                    />
                    <span>{product.brand ? `${product.brand} · ` : ""}{product.name}</span>
                  </label>
                ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted">FAQs</h3>
              {faqs.map((faq, index) => (
                <div key={index} className="grid gap-2">
                  <input
                    value={faq.question}
                    onChange={(event) =>
                      setFaqs((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, question: event.target.value } : item
                        )
                      )
                    }
                    placeholder="Question"
                    className={inputClass}
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(event) =>
                      setFaqs((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, answer: event.target.value } : item
                        )
                      )
                    }
                    placeholder="Answer"
                    rows={2}
                    className={inputClass}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFaqs((current) => [...current, { question: "", answer: "" }])}
                className="text-sm font-semibold text-primary"
              >
                Add FAQ
              </button>
            </div>
          </section>
        ) : null}

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
