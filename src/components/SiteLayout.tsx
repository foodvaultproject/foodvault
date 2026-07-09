"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { MemberSignupCtaProvider } from "@/components/member/MemberSignupCtaProvider";
import { Navigation } from "@/components/Navigation";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-screen bg-page">{children}</div>;
  }

  return (
    <MemberSignupCtaProvider>
      <Navigation />
      <main className="min-w-0 flex-1 bg-page">{children}</main>
      <Footer />
    </MemberSignupCtaProvider>
  );
}
