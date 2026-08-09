import { featuredBrands } from "@/data/homepage";
import { mockArticles } from "@/lib/admin/mock-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { partnerProfileSlug } from "@/lib/member/favorites-utils";
import { createClient } from "@/lib/supabase/server";

export const SITEMAP_BASE_URL = "https://www.foodvault.co.nz";

type StaticSitemapRoute = {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

export const STATIC_SITEMAP_ROUTES: StaticSitemapRoute[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/search", changeFrequency: "daily", priority: 0.9 },
  { path: "/explore", changeFrequency: "daily", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/for-brands", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.8 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.7 },
  { path: "/membership", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/discover", changeFrequency: "weekly", priority: 0.7 },
  { path: "/partners", changeFrequency: "weekly", priority: 0.7 },
  { path: "/partner-application", changeFrequency: "monthly", priority: 0.6 },
  { path: "/affiliate-program", changeFrequency: "monthly", priority: 0.5 },
  { path: "/affiliate-program/faq", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/affiliate-terms", changeFrequency: "yearly", priority: 0.3 },
];

export type SitemapDynamicEntry = {
  path: string;
  lastModified: Date;
};

function parseLastModified(value: string | null | undefined): Date {
  if (!value) return new Date();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? new Date() : new Date(parsed);
}

export async function getSitemapBrandEntries(): Promise<SitemapDynamicEntry[]> {
  if (!isSupabaseConfigured()) {
    return featuredBrands.map((brand) => ({
      path: `/brands/${partnerProfileSlug(brand.name)}`,
      lastModified: new Date(),
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_public_brand_profile")
    .select("slug, updated_at")
    .not("slug", "is", null);

  if (error || !data?.length) {
    return featuredBrands.map((brand) => ({
      path: `/brands/${partnerProfileSlug(brand.name)}`,
      lastModified: new Date(),
    }));
  }

  return data
    .map((row) => {
      const slug = String(row.slug ?? "").trim();
      if (!slug) return null;

      return {
        path: `/brands/${slug}`,
        lastModified: parseLastModified(row.updated_at as string | null),
      } satisfies SitemapDynamicEntry;
    })
    .filter((entry): entry is SitemapDynamicEntry => entry !== null);
}

export async function getSitemapDiscoverEntries(): Promise<SitemapDynamicEntry[]> {
  if (!isSupabaseConfigured()) {
    return mockArticles
      .filter((article) => article.status === "PUBLISHED")
      .map((article) => ({
        path: `/discover/${article.slug}`,
        lastModified: parseLastModified(article.updated_at ?? article.publish_date),
      }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discover_articles")
    .select("slug, updated_at, publish_date, created_at")
    .eq("status", "PUBLISHED");

  if (error || !data?.length) {
    return [];
  }

  return data
    .map((row) => {
      const slug = String(row.slug ?? "").trim();
      if (!slug) return null;

      return {
        path: `/discover/${slug}`,
        lastModified: parseLastModified(
          (row.updated_at as string | null) ??
            (row.publish_date as string | null) ??
            (row.created_at as string | null)
        ),
      } satisfies SitemapDynamicEntry;
    })
    .filter((entry): entry is SitemapDynamicEntry => entry !== null);
}

export function buildSitemapUrl(path: string): string {
  return `${SITEMAP_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
