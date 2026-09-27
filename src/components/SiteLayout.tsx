"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AuthSessionRefresh } from "@/components/auth/AuthSessionRefresh";
import { ConsumerSecondaryNav } from "@/components/consumer/ConsumerSecondaryNav";
import { Footer } from "@/components/Footer";
import { MemberSignupCtaProvider } from "@/components/member/MemberSignupCtaProvider";
import { Navigation } from "@/components/Navigation";
import { NavigationPrefetch } from "@/components/navigation/NavigationPrefetch";
import { PantryMarketHeader } from "@/components/pantry/PantryMarketHeader";
import { PantryMarketProvider } from "@/components/pantry/PantryMarketProvider";
import { shouldShowConsumerSecondaryNav, isVaultMarketPath } from "@/lib/consumer-nav-restructure";
import type { FoodVaultProduct } from "@/types/commerce";

export function SiteLayout({
  children,
  products,
}: {
  children: React.ReactNode;
  products: FoodVaultProduct[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const showConsumerSecondaryNav = shouldShowConsumerSecondaryNav(pathname);
  const vaultMarket = isVaultMarketPath(pathname);

  if (isAdmin) {
    const isPackingSlip = pathname.includes("/packing-slip");
    return (
      <div className={isPackingSlip ? "min-h-screen bg-white" : "min-h-screen bg-page"}>
        {children}
      </div>
    );
  }

  return (
    <MemberSignupCtaProvider>
      <PantryMarketProvider products={products}>
        <AuthSessionRefresh />
        <NavigationPrefetch />
        <Navigation />
        {showConsumerSecondaryNav ? <ConsumerSecondaryNav /> : null}
        <main
          className={`min-w-0 flex-1 bg-page ${
            showConsumerSecondaryNav
              ? "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
              : ""
          }`}
        >
          {vaultMarket ? (
            <Suspense fallback={null}>
              <PantryMarketHeader />
            </Suspense>
          ) : null}
          {children}
        </main>
        <Footer mobileBottomNavInset={showConsumerSecondaryNav} vaultMarket={vaultMarket} />
      </PantryMarketProvider>
    </MemberSignupCtaProvider>
  );
}
