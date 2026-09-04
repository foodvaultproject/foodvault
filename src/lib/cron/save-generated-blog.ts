import type { SupabaseClient } from "@supabase/supabase-js";
import { slugifyTitle, type DiscoverCategory } from "@/lib/admin/types";
import {
  featuredPartnerFromPayload,
  type BlogGenerationPayload,
} from "@/lib/cron/generate-blog";
import type { GeneratedBlogDraft } from "@/lib/cron/generate-blog-gemini";
import { normalizeArticleBodyHtml } from "@/lib/discover/article-blocks";
import { DISCOVER_ARTICLE_AUTHOR } from "@/lib/discover/constants";
import { formatArticleBodyContent } from "@/lib/discover/format-article-body";

function isMissingColumnError(error: { message?: string } | null) {
  if (!error?.message) return false;
  return /could not find the .* column|column .* does not exist|schema cache/i.test(error.message);
}

async function uniqueDiscoverSlug(admin: SupabaseClient, rawSlug: string, title: string) {
  const base = slugifyTitle(rawSlug) || slugifyTitle(title) || `foodvault-${Date.now()}`;
  let slug = base;
  let suffix = 2;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data, error } = await admin
      .from("discover_articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check article slug: ${error.message}`);
    }
    if (!data) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return `${base}-${Date.now()}`;
}

function estimateReadTimeMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(5, Math.min(15, Math.round(words / 200)));
}

export type SavedGeneratedBlog = {
  title: string;
  slug: string;
  category: DiscoverCategory;
};

export async function saveGeneratedDiscoverArticle(
  admin: SupabaseClient,
  payload: BlogGenerationPayload,
  draft: GeneratedBlogDraft
): Promise<SavedGeneratedBlog> {
  const now = new Date().toISOString();
  const slug = await uniqueDiscoverSlug(admin, draft.slug, draft.title);
  const body = normalizeArticleBodyHtml(
    formatArticleBodyContent(draft.content, draft.title),
    draft.title
  );
  const partner = featuredPartnerFromPayload(payload);
  const heroImageUrl =
    partner?.bannerImageUrl || partner?.galleryImageUrls[0] || partner?.logoUrl || null;
  const metaTags = [
    payload.cmsCategory,
    "FoodVault",
    partner?.businessName,
  ].filter((tag): tag is string => Boolean(tag));

  const insertPayload = {
    title: draft.title,
    slug,
    category: payload.cmsCategory,
    summary: draft.excerpt,
    body,
    hero_image_url: heroImageUrl,
    meta_title: draft.meta_title,
    meta_description: draft.meta_description,
    meta_tags: metaTags,
    featured: false,
    publish_date: now,
    status: "PUBLISHED",
    author_name: DISCOVER_ARTICLE_AUTHOR,
    read_time_minutes: estimateReadTimeMinutes(draft.content),
    updated_at: now,
  };

  const { error } = await admin.from("discover_articles").insert(insertPayload);
  if (error) {
    throw new Error(`Failed to publish Discover article: ${error.message}`);
  }

  if (partner?.id) {
    const update = await admin
      .from("partners")
      .update({ last_blogged_at: now, updated_at: now })
      .eq("id", partner.id);

    if (update.error && !isMissingColumnError(update.error)) {
      throw new Error(`Failed to update last_blogged_at: ${update.error.message}`);
    }
  }

  return {
    title: draft.title,
    slug,
    category: payload.cmsCategory,
  };
}
