"use client";

import Link from "next/link";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { HOSPITALITY_HOME_REGION_CHIPS } from "@/lib/hospitality/constants";
import {
  filterHospitalityDemoVenues,
  hospitalityVenueToBrandCard,
  listHospitalityDemoVenues,
} from "@/lib/hospitality/demo-venues";
import { consumerSearchPath } from "@/lib/consumer-nav-restructure";
import { SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";

type HomeDineLocalSectionProps = {
  canFavorite?: boolean;
  favoritedPartnerIds?: string[];
  compactSpacing?: boolean;
};

function localSearchHref(chip: (typeof HOSPITALITY_HOME_REGION_CHIPS)[number]) {
  const params = new URLSearchParams({ mode: "local" });
  if ("region" in chip && chip.region) params.set("region", chip.region);
  if ("city" in chip && chip.city) params.set("city", chip.city);
  return `${consumerSearchPath()}?${params.toString()}`;
}

export function HomeDineLocalSection({
  canFavorite = false,
  favoritedPartnerIds = [],
  compactSpacing = false,
}: HomeDineLocalSectionProps) {
  const venues = listHospitalityDemoVenues()
    .slice(0, 4)
    .map(hospitalityVenueToBrandCard);
  const favoritedSet = new Set(favoritedPartnerIds);

  return (
    <section className={`bg-background ${compactSpacing ? "py-8 sm:py-10" : SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Dine &amp; Save Locally
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Member offers at cafes, restaurants, bakeries, and delis — redeem in person.
            </p>
          </div>
          <Link
            href={`${consumerSearchPath()}?mode=local`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all local venues
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {HOSPITALITY_HOME_REGION_CHIPS.map((chip) => (
            <Link
              key={chip.id}
              href={localSearchHref(chip)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              {chip.label}
            </Link>
          ))}
        </div>

        <div className={`mt-5 ${brandTileGridClass}`}>
          {venues.map((brand) => (
            <BrowseBrandCard
              key={brand.id}
              brand={brand}
              canFavorite={canFavorite}
              initialFavorited={favoritedSet.has(brand.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function countHospitalityVenuesForChip(
  chip: (typeof HOSPITALITY_HOME_REGION_CHIPS)[number]
) {
  return filterHospitalityDemoVenues({
    region: "region" in chip ? chip.region : undefined,
    city: "city" in chip ? chip.city : undefined,
  }).length;
}
