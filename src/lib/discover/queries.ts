import { mockArticles } from "@/lib/admin/mock-data";
import {
  type AnyDiscoverCategory,
  type DiscoverArticleRow,
  type DiscoverFaq,
  type DiscoverSite,
} from "@/lib/admin/types";
import { resolveDiscoverAuthorName } from "@/lib/discover/constants";
import {
  categoriesForSite,
  isRemovedDiscoverCategory,
  normalizeDiscoverCategory,
} from "@/lib/discover/categories";
import { parseDiscoverFaqs, parseMetaTags } from "@/lib/discover/meta-tags";
import { isSupabaseConfigured } from "@/lib/auth";
import { createPublicReadClient } from "@/lib/supabase/public-read";

export const DEFAULT_DISCOVER_HERO =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop";

export type DiscoverArticleCard = {
  id: string;
  slug: string;
  title: string;
  category: AnyDiscoverCategory;
  summary: string | null;
  heroImageUrl: string;
  readTimeMinutes: number;
  publishDate: string | null;
  authorName: string | null;
  featured: boolean;
};

export type DiscoverPageContent = {
  featured: DiscoverArticleCard | null;
  byCategory: Record<string, DiscoverArticleCard[]>;
  homepageCards: DiscoverArticleCard[];
};

export type DiscoverArticlePageData = DiscoverArticleCard & {
  body: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaTags: string[];
  relatedProductIds: string[];
  faqs: DiscoverFaq[];
  site: DiscoverSite;
  updatedAt: string | null;
};

function articleSite(row: DiscoverArticleRow, fallback: DiscoverSite): DiscoverSite {
  return row.site === "stockup" ? "stockup" : row.site === "foodvault" ? "foodvault" : fallback;
}

function toDiscoverCategory(value: string, site: DiscoverSite): AnyDiscoverCategory | null {
  if (site === "foodvault" && isRemovedDiscoverCategory(value)) return null;
  return normalizeDiscoverCategory(value, site);
}

function sortByPublishDate(rows: DiscoverArticleRow[]): DiscoverArticleRow[] {
  return [...rows].sort((a, b) => {
    const aTime = a.publish_date ? Date.parse(a.publish_date) : Date.parse(a.created_at);
    const bTime = b.publish_date ? Date.parse(b.publish_date) : Date.parse(b.created_at);
    return bTime - aTime;
  });
}

export function mapArticleRow(
  row: DiscoverArticleRow,
  site: DiscoverSite = "foodvault"
): DiscoverArticleCard | null {
  const category = toDiscoverCategory(row.category, articleSite(row, site));
  if (!category) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category,
    summary: row.summary,
    heroImageUrl: row.hero_image_url ?? DEFAULT_DISCOVER_HERO,
    readTimeMinutes: row.read_time_minutes ?? 5,
    publishDate: row.publish_date,
    authorName: resolveDiscoverAuthorName(row.author_name),
    featured: row.featured,
  };
}

export function articleHref(slug: string) {
  return `/discover/${slug}`;
}

export function formatReadTime(minutes: number) {
  return `${minutes} min read`;
}

export function formatPublishDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-NZ", {
    month: "long",
    year: "numeric",
  });
}

function buildDiscoverContent(
  rows: DiscoverArticleRow[],
  site: DiscoverSite
): DiscoverPageContent {
  const published = sortByPublishDate(rows.filter((row) => row.status === "PUBLISHED"));
  const cards = published
    .map((row) => mapArticleRow(row, site))
    .filter((card): card is DiscoverArticleCard => card !== null);

  const byCategory = Object.fromEntries(
    categoriesForSite(site).map((category) => [
      category,
      cards.filter((card) => card.category === category),
    ])
  );

  const featured =
    cards.find((card) => card.featured) ??
    cards[0] ??
    null;

  const homepageCards = cards.slice(0, 6);

  return { featured, byCategory, homepageCards };
}

async function fetchPublishedRows(site: DiscoverSite): Promise<DiscoverArticleRow[]> {
  if (!isSupabaseConfigured()) {
    return mockArticles.filter(
      (article) => article.status === "PUBLISHED" && (article.site ?? "foodvault") === site
    );
  }

  const supabase = createPublicReadClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("discover_articles")
    .select("*")
    .eq("site", site)
    .eq("status", "PUBLISHED")
    .order("publish_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (data ?? []) as DiscoverArticleRow[];
}

export async function getPublishedArticlesByCategory(
  site: DiscoverSite,
  category: AnyDiscoverCategory
): Promise<DiscoverArticlePageData[]> {
  const rows = await fetchPublishedRows(site);
  return rows
    .filter((row) => row.category === category && row.status === "PUBLISHED")
    .map((row) => mapRowToPageData(row, site))
    .filter((article): article is DiscoverArticlePageData => article !== null);
}

export async function getDiscoverPageContent(site: DiscoverSite = "foodvault"): Promise<DiscoverPageContent> {
  const rows = await fetchPublishedRows(site);
  return buildDiscoverContent(rows, site);
}

function mapRowToPageData(
  row: DiscoverArticleRow,
  site: DiscoverSite
): DiscoverArticlePageData | null {
  const resolvedSite = articleSite(row, site);
  const card = mapArticleRow(row, resolvedSite);
  if (!card) return null;

  return {
    ...card,
    body: row.body,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    metaTags: parseMetaTags(row.meta_tags),
    relatedProductIds: Array.isArray(row.related_product_ids)
      ? row.related_product_ids.filter(Boolean)
      : [],
    faqs: parseDiscoverFaqs(row.faqs),
    site: resolvedSite,
    updatedAt: row.updated_at ?? row.created_at ?? null,
  };
}

export function pickContinueReadingArticles(
  articles: DiscoverArticleCard[],
  currentSlug: string,
  category: AnyDiscoverCategory,
  limit = 5
): DiscoverArticleCard[] {
  const others = articles.filter((article) => article.slug !== currentSlug);
  const sameCategory = others.filter((article) => article.category === category);
  const differentCategory = others.filter((article) => article.category !== category);

  return [...sameCategory, ...differentCategory].slice(0, limit);
}

export async function getPublishedArticleBySlug(
  slug: string,
  site: DiscoverSite = "foodvault"
): Promise<DiscoverArticlePageData | null> {
  if (!isSupabaseConfigured()) {
    const row = mockArticles.find(
      (article) =>
        article.slug === slug &&
        article.status === "PUBLISHED" &&
        (article.site ?? "foodvault") === site
    );
    if (!row) return null;
    return mapRowToPageData(row, site);
  }

  const supabase = createPublicReadClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("discover_articles")
    .select("*")
    .eq("site", site)
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (!data) return null;
  return mapRowToPageData(data as DiscoverArticleRow, site);
}

export async function getDiscoverArticlePageData(
  slug: string,
  site: DiscoverSite = "foodvault"
): Promise<{
  article: DiscoverArticlePageData;
  continueReading: DiscoverArticleCard[];
} | null> {
  const rows = await fetchPublishedRows(site);
  const articleRow = rows.find((row) => row.slug === slug);
  if (!articleRow) {
    const article = await getPublishedArticleBySlug(slug, site);
    if (!article) return null;
    const allCards = rows
      .map((row) => mapArticleRow(row, site))
      .filter((card): card is DiscoverArticleCard => card !== null);
    return {
      article,
      continueReading: pickContinueReadingArticles(allCards, slug, article.category),
    };
  }

  const article = mapRowToPageData(articleRow, site);
  if (!article) return null;

  const allCards = rows
    .map((row) => mapArticleRow(row, site))
    .filter((card): card is DiscoverArticleCard => card !== null);

  return {
    article,
    continueReading: pickContinueReadingArticles(allCards, slug, article.category),
  };
}

export async function getStockUpGuidesForProduct(productId: string): Promise<
  Array<{ title: string; slug: string }>
> {
  if (!productId || !isSupabaseConfigured()) return [];
  const supabase = createPublicReadClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("discover_articles")
    .select("title, slug")
    .eq("site", "stockup")
    .eq("status", "PUBLISHED")
    .contains("related_product_ids", [productId])
    .order("publish_date", { ascending: false });

  return (data ?? [])
    .map((row) => ({
      title: String(row.title ?? "").trim(),
      slug: String(row.slug ?? "").trim(),
    }))
    .filter((row) => row.title && row.slug);
}
