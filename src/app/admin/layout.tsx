import type { Metadata } from "next";
import { getAppMode, siteDisplayName } from "@/lib/app-mode";

const adminName = siteDisplayName(getAppMode());

export const metadata: Metadata = {
  title: `${adminName} OS`,
  description: `Internal administrative portal for ${adminName} staff.`,
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
