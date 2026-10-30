import type { Metadata } from "next";
import { CookieContent } from "@/components/legal/CookieContent";
import { isStockUpRequest, StockUpCookieContent } from "@/components/legal/StockUpLegal";

export async function generateMetadata(): Promise<Metadata> {
  if (await isStockUpRequest()) {
    return {
      title: "Cookie Policy",
      description: "How StockUp uses cookies to keep you signed in and remember your cart.",
    };
  }

  return {
    title: "Cookie Policy",
    description:
      "FoodVault Cookie Policy for New Zealand users. Learn how Britomart Groceries Limited uses cookies for authentication, security, analytics, and platform performance.",
  };
}

export default async function CookiesPage() {
  if (await isStockUpRequest()) return <StockUpCookieContent />;
  return <CookieContent />;
}
