import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Brand reports: up to 5 attachments × 10 MB (+ multipart overhead).
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb",
    },
  },
  images: {
    // Serve images directly (Supabase/public URLs) — bypass Vercel Image Optimization
    // to avoid transformation quota limits on high-traffic logos, banners, and cards.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
