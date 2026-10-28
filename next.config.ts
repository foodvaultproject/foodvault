import type { NextConfig } from "next";
import {
  FOODVAULT_EXACT_ROUTES,
  FOODVAULT_GUARDED_PREFIXES,
  FOODVAULT_HOSTS,
  FOODVAULT_ORIGIN,
  STOCKUP_GUARDED_PREFIXES,
  STOCKUP_HOSTS,
  STOCKUP_ORIGIN,
} from "./src/lib/mode-routes";

function supabaseStorageHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = supabaseStorageHostname();

const supabaseStoragePattern = {
  protocol: "https" as const,
  pathname: "/storage/v1/object/public/**",
};

function prefixRedirects(
  prefixes: readonly string[],
  origin: string
): { source: string; destination: string }[] {
  return prefixes.flatMap((prefix) => [
    { source: prefix, destination: `${origin}${prefix}` },
    { source: `${prefix}/:path*`, destination: `${origin}${prefix}/:path*` },
  ]);
}

function hostRedirects(
  hosts: readonly string[],
  rules: { source: string; destination: string }[]
): { source: string; destination: string; permanent: false; has: [{ type: "host"; value: string }] }[] {
  return hosts.flatMap((host) =>
    rules.map((rule) => ({
      source: rule.source,
      destination: rule.destination,
      permanent: false as const,
      has: [{ type: "host" as const, value: host }],
    }))
  );
}

const nextConfig: NextConfig = {
  // Brand reports: up to 5 attachments × 10 MB (+ multipart overhead).
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb",
    },
  },
  async redirects() {
    return [
      ...hostRedirects(STOCKUP_HOSTS, [
        ...FOODVAULT_EXACT_ROUTES.map((source) => ({
          source,
          destination: `${FOODVAULT_ORIGIN}${source}`,
        })),
        ...prefixRedirects(FOODVAULT_GUARDED_PREFIXES, FOODVAULT_ORIGIN),
      ]),
      ...hostRedirects(FOODVAULT_HOSTS, [
        { source: "/pantry", destination: STOCKUP_ORIGIN },
        { source: "/pantry/:path*", destination: `${STOCKUP_ORIGIN}/:path*` },
        ...prefixRedirects(
          STOCKUP_GUARDED_PREFIXES.filter((prefix) => prefix !== "/pantry"),
          STOCKUP_ORIGIN
        ),
      ]),
      {
        source: "/signup/payment",
        destination: "/signup/membership",
        permanent: true,
      },
      {
        source: "/pantry/checkout",
        destination: "/checkout",
        permanent: false,
      },
      {
        source: "/pantry/list",
        destination: "/list",
        permanent: true,
      },
      {
        source: "/pantry/order-success",
        destination: "/order-success",
        permanent: true,
      },
      {
        source: "/pantry",
        has: [{ type: "host", value: "www.stockup.co.nz" }],
        destination: "/",
        permanent: false,
      },
      {
        source: "/pantry",
        has: [{ type: "host", value: "stockup.co.nz" }],
        destination: "/",
        permanent: false,
      },
      {
        // Retired four-segment catalog URLs: /pantry/{department}/{subcategory}/{slug}.
        source: "/pantry/:department/:subcategory/:slug",
        destination: "/:department/:subcategory/:slug",
        permanent: false,
      },
      {
        // Pantry-department products are /{subcategory}/{slug}. Keep the old
        // /pantry/{subcategory}/{slug} address pointed at that page.
        source: "/pantry/:subcategory/:slug",
        destination: "/:subcategory/:slug",
        permanent: false,
      },
      {
        source: "/partners",
        has: [{ type: "host", value: "www.foodvault.co.nz" }],
        destination: "/vault-market",
        permanent: false,
      },
      {
        source: "/partners",
        has: [{ type: "host", value: "foodvault.co.nz" }],
        destination: "/vault-market",
        permanent: false,
      },
      {
        source: "/browse-brands",
        has: [{ type: "host", value: "www.foodvault.co.nz" }],
        destination: "/vault-market",
        permanent: false,
      },
      {
        source: "/browse-brands/:path*",
        has: [{ type: "host", value: "www.foodvault.co.nz" }],
        destination: "/vault-market",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/opengraph-image.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/vaultmarket/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    // Bypass /_next/image so browsers load Storage URLs directly. Vercel Image
    // Optimization is returning 402 (quota) even though Supabase itself is 200.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        ...supabaseStoragePattern,
        hostname: "*.supabase.co",
      },
      ...(supabaseHostname
        ? [
            {
              ...supabaseStoragePattern,
              hostname: supabaseHostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
