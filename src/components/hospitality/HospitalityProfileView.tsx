"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandGallery } from "@/components/brands/BrandGallery";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { FavoriteToggleIcon } from "@/components/favorites/FavoriteToggleButton";
import { HospitalityVenueDetails } from "@/components/hospitality/HospitalityVenueDetails";
import { VerificationModal } from "@/components/verification/VerificationModal";
import { PartnerBanner } from "@/components/partners/PartnerBanner";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import {
  HOSPITALITY_REDEMPTION_CAP_LABEL,
  MAX_HOSPITALITY_PROFILE_GALLERY_IMAGES,
} from "@/lib/hospitality/constants";
import { hospitalityDirectionsHref } from "@/lib/hospitality/maps";
import {
  getMembershipPassViewerAction,
  type MembershipPassViewer,
} from "@/lib/hospitality/pass-viewer";
import { formatHospitalityLocationLabel } from "@/lib/hospitality/types";
import { consumerSearchPath } from "@/lib/consumer-nav-restructure";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { PartnerProfile, ProfileViewerContext } from "@/lib/member/partner-profile";

const SECTION_CARD = "rounded-lg border border-border bg-background p-5 shadow-sm";

type HospitalityProfileViewProps = {
  profile: PartnerProfile;
  viewer: ProfileViewerContext;
  recommended: BrandCard[];
  favoritedPartnerIds?: string[];
};

export function HospitalityProfileView({
  profile,
  viewer,
  recommended,
  favoritedPartnerIds = [],
}: HospitalityProfileViewProps) {
  const hospitality = profile.hospitality;
  const [passOpen, setPassOpen] = useState(false);
  const [passViewer, setPassViewer] = useState<MembershipPassViewer | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const favoritedSet = useMemo(
    () => new Set(favoritedPartnerIds),
    [favoritedPartnerIds]
  );

  if (!hospitality) return null;

  const locationLabel = formatHospitalityLocationLabel(hospitality.location);
  const directionsHref = hospitalityDirectionsHref(hospitality.location);
  const galleryImages = profile.galleryImageUrls.slice(
    0,
    MAX_HOSPITALITY_PROFILE_GALLERY_IMAGES
  );
  const offerImages = profile.offerImageUrls.filter(Boolean);
  const offerTitle = hospitality.offerTitle || profile.discountLabel;

  async function handleShowMembership() {
    setPassError(null);
    setPassLoading(true);
    try {
      const nextViewer = await getMembershipPassViewerAction();
      if (!nextViewer.isLoggedIn) {
        window.location.href = "/signup";
        return;
      }
      setPassViewer({
        ...nextViewer,
        fullName: nextViewer.fullName || "FoodVault Member",
      });
      setPassOpen(true);
    } catch {
      setPassError("Unable to open your membership pass. Please try again.");
    } finally {
      setPassLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <PartnerBanner
            src={profile.bannerImageUrl}
            alt=""
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </PartnerBanner>

          <div className="relative p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex gap-4">
                  <PartnerLogo
                    src={profile.logoUrl}
                    originalSrc={profile.logoOriginalUrl}
                    alt={`${profile.businessName} logo`}
                    businessName={profile.businessName}
                    size="md"
                    bordered
                    shadow
                    crop={profile.logoCrop}
                    className="relative z-10 -mt-12 shrink-0 sm:-mt-14"
                    priority
                  />

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-lg font-bold text-foreground">
                            {profile.businessName}
                          </h1>
                          {profile.department ? (
                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                              {profile.department}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {viewer.isLoggedIn && !viewer.canFavorite ? null : (
                        <FavoriteToggleIcon
                          partnerId={profile.id}
                          initialFavorited={viewer.isFavorited}
                        />
                      )}
                    </div>

                    {profile.shortDescription ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {profile.shortDescription}
                      </p>
                    ) : null}

                    {locationLabel ? (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPinIcon />
                        {locationLabel}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleShowMembership()}
                        disabled={passLoading}
                        className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        {passLoading ? "Opening…" : "Show Membership"}
                      </button>
                      <a
                        href={directionsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
                      >
                        Get Directions
                        <span aria-hidden="true">&#8599;</span>
                      </a>
                    </div>
                    {passError ? (
                      <p className="mt-2 text-xs text-red-600">{passError}</p>
                    ) : null}
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Show your live membership pass at the counter. Screenshots will not match
                      the ticking clock.
                    </p>
                  </div>
                </div>
              </div>

              <div
                id="offer"
                className="w-full shrink-0 rounded-lg border border-primary/30 bg-primary/[0.04] p-4 lg:max-w-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Member offer
                </p>
                <p className="mt-1 text-lg font-extrabold leading-tight text-primary">
                  {offerTitle}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {HOSPITALITY_REDEMPTION_CAP_LABEL}
                </span>
                {hospitality.offerTerms ? (
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wide">T&amp;Cs: </span>
                    {hospitality.offerTerms}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 space-y-4">
          {profile.brandStory ? (
            <section className={SECTION_CARD}>
              <h2 className="text-sm font-semibold text-foreground">About the venue</h2>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {profile.brandStory}
              </p>
            </section>
          ) : null}

          <HospitalityVenueDetails profile={profile} />

          {offerImages.length > 0 ? (
            <section id="whats-on-offer" className={SECTION_CARD}>
              <h2 className="text-sm font-semibold text-foreground">Whats on offer</h2>
              <div className="mt-3">
                <BrandGallery
                  images={offerImages}
                  businessName={`${profile.businessName} offer`}
                />
              </div>
            </section>
          ) : null}

          {galleryImages.length > 0 ? (
            <section id="gallery" className={SECTION_CARD}>
              <h2 className="text-sm font-semibold text-foreground">Gallery</h2>
              <div className="mt-3">
                <BrandGallery
                  images={galleryImages}
                  businessName={profile.businessName}
                />
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {recommended.length > 0 ? (
        <section
          aria-labelledby="recommended-venues-heading"
          className="mt-4 border-t border-border bg-background py-6"
        >
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="recommended-venues-heading"
                className="text-sm font-semibold text-foreground"
              >
                More local venues
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Discover more cafes, restaurants, bakeries, and delis with member offers.
              </p>
            </div>
            <div className={`mt-5 ${brandTileGridClass}`}>
              {recommended.map((brand) => (
                <BrowseBrandCard
                  key={brand.id}
                  brand={brand}
                  canFavorite={viewer.canFavorite}
                  initialFavorited={favoritedSet.has(brand.id)}
                />
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                href={`${consumerSearchPath()}?mode=local`}
                className="inline-flex items-center justify-center rounded-sm border-2 border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Browse Local Venues
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <VerificationModal
        open={passOpen}
        onClose={() => setPassOpen(false)}
        venueName={profile.businessName}
        offerTitle={offerTitle}
        viewer={passViewer}
      />
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}
