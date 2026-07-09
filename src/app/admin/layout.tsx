import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FoodVault OS",
  description: "Internal administrative portal for FoodVault staff.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
