import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { canonicalSiteOrigin, getAppMode } from "@/lib/app-mode";

const PUBLIC_PATHS = ["/", "/pantry", "/discover", "/faq"];
const PRIVATE_PATHS = ["/admin", "/api", "/account", "/checkout", "/order-success"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const origin = canonicalSiteOrigin(
    getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host"))
  );

  return {
    rules: [
      {
        userAgent: ["Googlebot", "Bingbot", "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"],
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "CCBot", "Bytespider", "Amazonbot"],
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
