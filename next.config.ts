import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  // Brand reports: up to 5 attachments × 10 MB (+ multipart overhead).
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb",
    },
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
    ];
  },
  images: {
    // Keep the built-in optimizer on so Vercel CDN caches `/_next/image` variants.
    unoptimized: false,
    // Partner/article objects use unique Storage paths; a long TTL avoids re-fetching
    // from Supabase on every request. Upstream Cache-Control wins if it is larger.
    minimumCacheTTL: 2678400,
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
