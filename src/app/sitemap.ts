import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { canonicalSiteOrigin, getAppMode, STOCKUP_ORIGIN } from "@/lib/app-mode";
import { pantryProductPath } from "@/lib/commerce/catalog";
import { getActiveVaultMarketProducts } from "@/lib/commerce/products";
import {
  STATIC_SITEMAP_ROUTES,
  buildSitemapUrl,
  getSitemapBrandEntries,
  getSitemapDiscoverEntries,
} from "@/lib/sitemap/entries";

export const revalidate = 86400;

const STOCKUP_STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/discover", changeFrequency: "weekly", priority: 0.8 },
  { path: "/discover/news", changeFrequency: "weekly", priority: 0.7 },
  { path: "/discover/savings", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.8 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const site =
    getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup"
      ? "stockup"
      : "foodvault";
  const origin = canonicalSiteOrigin(site);
  const generatedAt = new Date();

  if (site === "stockup") {
    const [discoverEntries, products] = await Promise.all([
      getSitemapDiscoverEntries("stockup"),
      getActiveVaultMarketProducts(),
    ]);

    return [
      ...STOCKUP_STATIC_ROUTES.map((route) => ({
        url: buildSitemapUrl(route.path, origin),
        lastModified: generatedAt,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      })),
      ...discoverEntries.map((entry) => ({
        url: buildSitemapUrl(entry.path, origin),
        lastModified: entry.lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...products.map((product) => ({
        url: buildSitemapUrl(pantryProductPath(product), STOCKUP_ORIGIN),
        lastModified: generatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  }

  const [brandEntries, discoverEntries] = await Promise.all([
    getSitemapBrandEntries(),
    getSitemapDiscoverEntries("foodvault"),
  ]);

  return [
    ...STATIC_SITEMAP_ROUTES.map((route) => ({
      url: buildSitemapUrl(route.path, origin),
      lastModified: generatedAt,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...brandEntries.map((entry) => ({
      url: buildSitemapUrl(entry.path, origin),
      lastModified: entry.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...discoverEntries.map((entry) => ({
      url: buildSitemapUrl(entry.path, origin),
      lastModified: entry.lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
