import type { Metadata } from "next";
import { PartnerAuthGuard } from "@/components/partner-portal/PartnerAuthGuard";
import { PartnerOnboardingProvider } from "@/components/partner-portal/PartnerOnboardingProvider";

export const metadata: Metadata = {
  title: "Partner Portal",
  description: "Manage your FoodVault partner listing, account, and support.",
};

export default function PartnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PartnerAuthGuard>
      <PartnerOnboardingProvider>{children}</PartnerOnboardingProvider>
    </PartnerAuthGuard>
  );
}
