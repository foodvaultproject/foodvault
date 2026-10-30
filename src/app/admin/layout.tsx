import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Internal administrative portal for FoodVault and StockUp staff.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
