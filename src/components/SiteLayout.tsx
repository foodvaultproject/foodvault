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
import { getAppMode } from "@/lib/app-mode";
import {
  isExplorePath,
  isPartnerDirectoryPath,
  isSearchPath,
  isVaultMarketPath,
} from "@/lib/consumer-nav-restructure";
import type { FoodVaultProduct } from "@/types/commerce";

export function SiteLayout({
  children,
  products,
}: {
  children: React.ReactNode;
  products: FoodVaultProduct[];
}) {
  const pathname = usePathname();
  const stockup = getAppMode() === "stockup";
  const isAdmin = pathname.startsWith("/admin");
  const showStorefrontHeader = stockup && isVaultMarketPath(pathname);
  const showConsumerSecondaryNav =
    !stockup &&
    (pathname === "/" ||
      isPartnerDirectoryPath(pathname) ||
      isExplorePath(pathname) ||
      isSearchPath(pathname));

  if (isAdmin) {
    const isPackingSlip = pathname.includes("/packing-slip");
    return (
      <div className={isPackingSlip ? "min-h-screen bg-white" : "min-h-screen bg-page"}>
        {children}
      </div>
    );
  }

  const shell = (
    <>
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
        {showStorefrontHeader ? (
          <Suspense fallback={null}>
            <PantryMarketHeader />
          </Suspense>
        ) : null}
        {children}
      </main>
      <Footer mobileBottomNavInset={showConsumerSecondaryNav} />
    </>
  );

  return (
    <MemberSignupCtaProvider>
      {stockup ? <PantryMarketProvider products={products}>{shell}</PantryMarketProvider> : shell}
    </MemberSignupCtaProvider>
  );
}
