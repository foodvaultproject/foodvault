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
