import type { MetadataRoute } from "next";
import {
  STATIC_SITEMAP_ROUTES,
  buildSitemapUrl,
  getSitemapBrandEntries,
  getSitemapDiscoverEntries,
} from "@/lib/sitemap/entries";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date();
  const [brandEntries, discoverEntries] = await Promise.all([
    getSitemapBrandEntries(),
    getSitemapDiscoverEntries(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_ROUTES.map((route) => ({
    url: buildSitemapUrl(route.path),
    lastModified: generatedAt,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brandEntries.map((entry) => ({
    url: buildSitemapUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const discoverRoutes: MetadataRoute.Sitemap = discoverEntries.map((entry) => ({
    url: buildSitemapUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...brandRoutes, ...discoverRoutes];
}
