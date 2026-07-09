import type { Metadata } from "next";
import { CookieContent } from "@/components/legal/CookieContent";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "FoodVault Cookie Policy for New Zealand users. Learn how Britomart Groceries Limited uses cookies for authentication, security, analytics, and platform performance.",
};

export default function CookiesPage() {
  return <CookieContent />;
}
