"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AuthSessionRefresh } from "@/components/auth/AuthSessionRefresh";
import { ConsumerSecondaryNav } from "@/components/consumer/ConsumerSecondaryNav";
import { Footer } from "@/components/Footer";
import { MemberSignupCtaProvider } from "@/components/member/MemberSignupCtaProvider";
import { Navigation } from "@/components/Navigation";
import { NavigationPrefetch } from "@/components/navigation/NavigationPrefetch";
import { StockUpBackButton } from "@/components/StockUpBackButton";
import { PantryMarketHeader } from "@/components/pantry/PantryMarketHeader";
import { PantryMarketProvider } from "@/components/pantry/PantryMarketProvider";
import { ReturnScrollRestore } from "@/components/pantry/ReturnScrollRestore";
import type { AppMode } from "@/lib/app-mode";
import {
  isExplorePath,
  isPartnerDirectoryPath,
  isSearchPath,
  isVaultMarketPath,
} from "@/lib/consumer-nav-restructure";
import type { FoodVaultProduct } from "@/types/commerce";

function isProductDetailPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 3) return false;
  return parts[0] !== "account" && parts[0] !== "admin" && parts[0] !== "auth";
}

export function SiteLayout({
  children,
  products,
  appMode,
}: {
  children: React.ReactNode;
  products: FoodVaultProduct[];
  appMode: AppMode;
}) {
  const pathname = usePathname();
  const stockup = appMode === "stockup";
  const isAdmin = pathname.startsWith("/admin");
  const showStorefrontHeader =
    stockup &&
    (isVaultMarketPath(pathname) ||
      pathname === "/account" ||
      pathname.startsWith("/account/") ||
      pathname === "/contact" ||
      pathname.startsWith("/contact/") ||
      pathname === "/terms" ||
      pathname === "/privacy" ||
      pathname === "/cookies" ||
      pathname === "/refund-policy");
  const showStockUpBack = stockup && pathname !== "/" && !isProductDetailPath(pathname);
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
      <Suspense fallback={null}>
        <ReturnScrollRestore />
      </Suspense>
      <AuthSessionRefresh />
      <NavigationPrefetch />
      <Navigation appMode={appMode} />
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
        {showStockUpBack ? (
          <div className="mx-auto w-full max-w-[1200px] px-4 pt-4 sm:px-6 lg:px-8">
            <StockUpBackButton />
          </div>
        ) : null}
        {children}
      </main>
      <Footer appMode={appMode} mobileBottomNavInset={showConsumerSecondaryNav} />
    </>
  );

  return (
    <MemberSignupCtaProvider>
      {stockup ? <PantryMarketProvider products={products}>{shell}</PantryMarketProvider> : shell}
    </MemberSignupCtaProvider>
  );
}
