import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Brand reports: up to 5 attachments × 10 MB (+ multipart overhead).
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb",
    },
  },
  images: {
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
