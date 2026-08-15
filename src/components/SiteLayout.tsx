"use client";

import { usePathname } from "next/navigation";
import { AuthSessionRefresh } from "@/components/auth/AuthSessionRefresh";
import { ConsumerSecondaryNav } from "@/components/consumer/ConsumerSecondaryNav";
import { Footer } from "@/components/Footer";
import { MemberSignupCtaProvider } from "@/components/member/MemberSignupCtaProvider";
import { Navigation } from "@/components/Navigation";
import { NavigationPrefetch } from "@/components/navigation/NavigationPrefetch";
import { shouldShowConsumerSecondaryNav } from "@/lib/consumer-nav-restructure";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const showConsumerSecondaryNav = shouldShowConsumerSecondaryNav(pathname);

  if (isAdmin) {
    return <div className="min-h-screen bg-page">{children}</div>;
  }

  return (
    <MemberSignupCtaProvider>
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
        {children}
      </main>
      <Footer mobileBottomNavInset={showConsumerSecondaryNav} />
    </MemberSignupCtaProvider>
  );
}
