import type { MetadataRoute } from "next";
import { SITEMAP_BASE_URL } from "@/lib/sitemap/entries";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITEMAP_BASE_URL}/sitemap.xml`,
  };
}
