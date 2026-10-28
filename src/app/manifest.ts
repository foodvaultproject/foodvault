import type { MetadataRoute } from "next";
import { getAppMode } from "@/lib/app-mode";

export default function manifest(): MetadataRoute.Manifest {
  const stockup = getAppMode() === "stockup";

  return {
    name: stockup ? "StockUp" : "FoodVault",
    short_name: stockup ? "StockUp" : "FoodVault",
    description: stockup
      ? "Direct supermarket delivery across New Zealand."
      : "Exclusive member pricing from independent food and beverage brands across New Zealand.",
    start_url: "/",
    display: "standalone",
    background_color: stockup ? "#10B981" : "#5848e8",
    theme_color: stockup ? "#10B981" : "#5848e8",
    icons: stockup
      ? [
          {
            src: "/Favicon/favicon_stockup.png",
            sizes: "2750x2750",
            type: "image/png",
            purpose: "any",
          },
        ]
      : [
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
