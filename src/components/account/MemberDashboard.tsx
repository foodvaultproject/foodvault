import Link from "next/link";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { MemberTrialBannerCard } from "@/components/account/MemberTrialBannerCard";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { MemberTrialBanner } from "@/lib/member/queries";
import {
  MEMBER_ACCOUNT_PATH,
  MEMBER_FAVORITES_PATH,
  MEMBER_MEMBERSHIP_PATH,
} from "@/lib/member/paths";

const quickActions = [
  {
    href: "/browse-brands",
    label: "Browse Brands",
    icon: (
      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 013 4.934v12.132a1.5 1.5 0 001.318 1.494l5.5.611a1.5 1.5 0 001.494-1.318V8.318a1.5 1.5 0 00-1.318-1.494L3 6.213V4.934z" />
      </svg>
    ),
  },
  {
    href: MEMBER_MEMBERSHIP_PATH,
    label: "Membership",
    icon: (
      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
  },
  {
    href: MEMBER_FAVORITES_PATH,
    label: "Favorites",
    icon: (
      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    href: MEMBER_ACCOUNT_PATH,
    label: "My Account",
    icon: (
      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

type MemberDashboardProps = {
  trialBanner: MemberTrialBanner | null;
  brands: BrandCard[];
  canFavorite: boolean;
  favoritedPartnerIds: string[];
  error?: string | null;
};

export function MemberDashboard({
  trialBanner,
  brands,
  canFavorite,
  favoritedPartnerIds,
  error,
}: MemberDashboardProps) {
  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:py-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          My Dashboard
        </h1>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {trialBanner?.showTrialBanner ? (
          <MemberTrialBannerCard trialBanner={trialBanner} className="mt-8" />
        ) : null}

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center rounded-lg border border-border bg-background px-6 py-8 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  {action.icon}
                </span>
                <span className="mt-4 text-sm font-semibold text-foreground">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {brands.length > 0 ? (
          <section className="mt-12">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">New This Week</h2>
              <Link href="/browse-brands" className="text-sm font-semibold text-primary hover:text-primary-hover">
                View All
              </Link>
            </div>
            <div className={`mt-6 ${brandTileGridClass}`}>
              {brands.map((brand) => (
                <BrowseBrandCard
                  key={brand.id}
                  brand={brand}
                  canFavorite={canFavorite}
                  initialFavorited={favoritedPartnerIds.includes(brand.id)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
