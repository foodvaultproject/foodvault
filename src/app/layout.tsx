import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { SiteLayout } from "@/components/SiteLayout";
import { locale } from "@/lib/locale";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://foodvault.co.nz"),
  title: {
    default: "FoodVault — Member pricing on the food you actually buy",
    template: "%s | FoodVault",
  },
  description:
    "Join FoodVault for exclusive member pricing from independent food and beverage brands across New Zealand. Save more every week on the products you love.",
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "/",
    siteName: "FoodVault",
    title: "FoodVault — Member pricing on the food you actually buy",
    description:
      "Join FoodVault for exclusive member pricing from independent food and beverage brands across New Zealand. Save more every week on the products you love.",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "FoodVault — Member pricing on the food you actually buy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodVault — Member pricing on the food you actually buy",
    description:
      "Join FoodVault for exclusive member pricing from independent food and beverage brands across New Zealand. Save more every week on the products you love.",
    images: ["/opengraph-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={locale.localeTag} className={`${hankenGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden font-sans">
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
