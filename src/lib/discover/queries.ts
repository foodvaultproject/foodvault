import { mockArticles } from "@/lib/admin/mock-data";
import {
  DISCOVER_CMS_CATEGORIES,
  type DiscoverArticleRow,
  type DiscoverCategory,
} from "@/lib/admin/types";
import {
  isRemovedDiscoverCategory,
  normalizeDiscoverCategory,
} from "@/lib/discover/categories";
import { parseMetaTags } from "@/lib/discover/meta-tags";
import { isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const DEFAULT_DISCOVER_HERO =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop";

export type DiscoverArticleCard = {
  id: string;
  slug: string;
  title: string;
  category: DiscoverCategory;
  summary: string | null;
  heroImageUrl: string;
  readTimeMinutes: number;
  publishDate: string | null;
  authorName: string | null;
  featured: boolean;
};

export type DiscoverPageContent = {
  featured: DiscoverArticleCard | null;
  byCategory: Record<DiscoverCategory, DiscoverArticleCard[]>;
  homepageCards: DiscoverArticleCard[];
};

export type DiscoverArticlePageData = DiscoverArticleCard & {
  body: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaTags: string[];
  updatedAt: string | null;
};

function toDiscoverCategory(value: string): DiscoverCategory | null {
  if (isRemovedDiscoverCategory(value)) return null;
  return normalizeDiscoverCategory(value);
}

function sortByPublishDate(rows: DiscoverArticleRow[]): DiscoverArticleRow[] {
  return [...rows].sort((a, b) => {
    const aTime = a.publish_date ? Date.parse(a.publish_date) : Date.parse(a.created_at);
    const bTime = b.publish_date ? Date.parse(b.publish_date) : Date.parse(b.created_at);
    return bTime - aTime;
  });
}

export function mapArticleRow(row: DiscoverArticleRow): DiscoverArticleCard | null {
  const category = toDiscoverCategory(row.category);
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
    authorName: row.author_name,
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

function buildDiscoverContent(rows: DiscoverArticleRow[]): DiscoverPageContent {
  const published = sortByPublishDate(rows.filter((row) => row.status === "PUBLISHED"));
  const cards = published
    .map(mapArticleRow)
    .filter((card): card is DiscoverArticleCard => card !== null);

  const byCategory = Object.fromEntries(
    DISCOVER_CMS_CATEGORIES.map((category) => [
      category,
      cards.filter((card) => card.category === category),
    ])
  ) as Record<DiscoverCategory, DiscoverArticleCard[]>;

  const featured =
    cards.find((card) => card.featured) ??
    cards[0] ??
    null;

  const homepageCards = DISCOVER_CMS_CATEGORIES.map(
    (category) => byCategory[category][0]
  ).filter((card): card is DiscoverArticleCard => Boolean(card));

  return { featured, byCategory, homepageCards };
}

async function fetchPublishedRows(): Promise<DiscoverArticleRow[]> {
  if (!isSupabaseConfigured()) {
    return mockArticles.filter((article) => article.status === "PUBLISHED");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("discover_articles")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("publish_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (data ?? []) as DiscoverArticleRow[];
}

export async function getPublishedArticlesByCategory(
  category: DiscoverCategory
): Promise<DiscoverArticlePageData[]> {
  const rows = await fetchPublishedRows();
  return rows
    .filter((row) => row.category === category && row.status === "PUBLISHED")
    .map(mapRowToPageData)
    .filter((article): article is DiscoverArticlePageData => article !== null);
}

export async function getDiscoverPageContent(): Promise<DiscoverPageContent> {
  const rows = await fetchPublishedRows();
  return buildDiscoverContent(rows);
}

function mapRowToPageData(row: DiscoverArticleRow): DiscoverArticlePageData | null {
  const card = mapArticleRow(row);
  if (!card) return null;

  return {
    ...card,
    body: row.body,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    metaTags: parseMetaTags(row.meta_tags),
    updatedAt: row.updated_at ?? row.created_at ?? null,
  };
}

export function pickContinueReadingArticles(
  articles: DiscoverArticleCard[],
  currentSlug: string,
  category: DiscoverCategory,
  limit = 5
): DiscoverArticleCard[] {
  const others = articles.filter((article) => article.slug !== currentSlug);
  const sameCategory = others.filter((article) => article.category === category);
  const differentCategory = others.filter((article) => article.category !== category);

  return [...sameCategory, ...differentCategory].slice(0, limit);
}

export async function getPublishedArticleBySlug(
  slug: string
): Promise<DiscoverArticlePageData | null> {
  if (!isSupabaseConfigured()) {
    const row = mockArticles.find(
      (article) => article.slug === slug && article.status === "PUBLISHED"
    );
    if (!row) return null;
    return mapRowToPageData(row);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("discover_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (!data) return null;
  return mapRowToPageData(data as DiscoverArticleRow);
}

export async function getDiscoverArticlePageData(slug: string): Promise<{
  article: DiscoverArticlePageData;
  continueReading: DiscoverArticleCard[];
} | null> {
  const rows = await fetchPublishedRows();
  const articleRow = rows.find((row) => row.slug === slug);
  if (!articleRow) {
    const article = await getPublishedArticleBySlug(slug);
    if (!article) return null;
    const allCards = rows
      .map(mapArticleRow)
      .filter((card): card is DiscoverArticleCard => card !== null);
    return {
      article,
      continueReading: pickContinueReadingArticles(allCards, slug, article.category),
    };
  }

  const article = mapRowToPageData(articleRow);
  if (!article) return null;

  const allCards = rows
    .map(mapArticleRow)
    .filter((card): card is DiscoverArticleCard => card !== null);

  return {
    article,
    continueReading: pickContinueReadingArticles(allCards, slug, article.category),
  };
}
