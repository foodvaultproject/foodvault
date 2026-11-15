import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { canonicalSiteOrigin, getAppMode } from "@/lib/app-mode";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const origin = canonicalSiteOrigin(
    getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host"))
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
