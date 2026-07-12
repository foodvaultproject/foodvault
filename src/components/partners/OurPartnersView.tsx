"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";

type PartnerLogoItem = {
  id: string;
  businessName: string;
  slug: string;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: import("@/lib/partner-logo-crop").LogoCropSettings | null;
};

type OurPartnersViewProps = {
  partners: PartnerLogoItem[];
};

export function OurPartnersView({ partners }: OurPartnersViewProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return partners;
    return partners.filter((partner) =>
      partner.businessName.toLowerCase().includes(query)
    );
  }, [partners, search]);

  return (
    <div className="min-h-screen bg-surface-lavender">
      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Our Partners
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          FoodVault connects members with a growing network of participating New
          Zealand brands offering exclusive member discounts. Browse the businesses
          that are part of the FoodVault community and discover new brands to enjoy.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/browse-brands"
            className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
          >
            Browse Brands
          </Link>
          <Link
            href="/for-brands"
            className="inline-flex w-full items-center justify-center rounded-sm border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface sm:w-auto"
          >
            Become a Partner
          </Link>
        </div>

        <div className="relative mt-8">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by business name..."
            aria-label="Search partners by business name"
            className="w-full rounded-md border border-border bg-background py-3.5 pl-12 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-background p-12 text-center">
            <p className="text-lg font-semibold text-foreground">No partners found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different business name, or browse all participating brands.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-2 gap-y-6 sm:gap-x-3 sm:gap-y-7 lg:grid-cols-10 lg:gap-x-3 lg:gap-y-8">
            {filtered.map((partner) => (
              <PartnerDirectoryItem key={partner.id} partner={partner} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#dfe3ff]">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Interested in Joining FoodVault?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Connect your business with members looking to save and discover new
            brands. It&apos;s free for businesses to advertise, reach new customers,
            and join the FoodVault network.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/partner-application"
              className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
            >
              Become a Partner
            </Link>
            <Link
              href="/for-brands"
              className="inline-flex w-full items-center justify-center rounded-sm border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PartnerDirectoryItem({ partner }: { partner: PartnerLogoItem }) {
  return (
    <Link
      href={partnerProfilePathFromSlug(partner.slug)}
      className="group flex min-h-[7.5rem] cursor-pointer flex-col items-center gap-2 text-center sm:min-h-[9rem] sm:gap-3"
      aria-label={`View ${partner.businessName}`}
    >
      <PartnerLogo
        src={partner.logoUrl}
        originalSrc={partner.logoOriginalUrl}
        alt={`${partner.businessName} logo`}
        businessName={partner.businessName}
        size="directory"
        bordered
        shadow
        className="transition-shadow duration-300 group-hover:shadow-lg"
        crop={partner.logoCrop}
      />
      <p className="line-clamp-2 min-h-[2.5rem] w-full px-0.5 text-xs font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-sm">
        {partner.businessName}
      </p>
    </Link>
  );
}
