import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Hanken_Grotesk } from "next/font/google";
import { SiteLayout } from "@/components/SiteLayout";
import { canonicalSiteOrigin, getAppMode, siteDisplayName } from "@/lib/app-mode";
import { getActiveVaultMarketProducts } from "@/lib/commerce/products";
import { locale } from "@/lib/locale";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const appMode = getAppMode();
const stockupSite = appMode === "stockup";
const siteName = siteDisplayName(appMode);
const siteOrigin = canonicalSiteOrigin(appMode);
const defaultTitle = stockupSite
  ? "StockUp | Direct Supermarket Delivery"
  : "FoodVault | Kiwi Brand Directory & Local Perks";
const defaultDescription = stockupSite
  ? "Shop StockUp for direct supermarket delivery. Saver pricing on everyday groceries, shipped across New Zealand."
  : "Browse Kiwi partner brands, in-store offers, and local perks across New Zealand.";

const openGraphImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: siteName,
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "/",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [openGraphImage],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = getAppMode() === "stockup" ? await getActiveVaultMarketProducts() : [];

  return (
    <html lang={locale.localeTag} className={`${hankenGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden font-sans">
        <SiteLayout products={products}>{children}</SiteLayout>
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
