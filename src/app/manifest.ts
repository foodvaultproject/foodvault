import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FoodVault",
    short_name: "FoodVault",
    description:
      "Exclusive member pricing from independent food and beverage brands across New Zealand.",
    start_url: "/",
    display: "standalone",
    background_color: "#5848e8",
    theme_color: "#5848e8",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
