"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrowseBrandCard } from "@/components/browse-brands/BrowseBrandCard";
import { brandTileGridClass } from "@/components/browse-brands/brand-card-layout";
import { BrandGallery } from "@/components/brands/BrandGallery";
import { PartnerProfileCategories } from "@/components/brands/PartnerProfileCategories";
import { DiscountCodeBlock } from "@/components/brands/DiscountCodeBlock";
import { AffiliateProgramProfileSection } from "@/components/brands/AffiliateProgramProfileSection";
import { ReportProfileTrigger } from "@/components/brands/ReportProfileTrigger";
import { FavoriteToggleButton } from "@/components/favorites/FavoriteToggleButton";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { SelectedProductGrid } from "@/components/partners/SelectedProductGrid";
import { PartnerBanner } from "@/components/partners/PartnerBanner";
import { PartnerOnboardingStatusBanner } from "@/components/partner-portal/PartnerOnboardingStatusBanner";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type {
  CodeAccessState,
  PartnerProfile,
  ProfileViewerContext,
} from "@/lib/member/partner-profile";
import type { BrandAffiliateViewerContext } from "@/lib/affiliate/server";
import {
  listPartnerSocialLinks,
  type SocialPlatform,
} from "@/lib/partner-social";

type PartnerProfileViewProps = {
  profile: PartnerProfile;
  code: string | null;
  codeState: CodeAccessState;
  viewer: ProfileViewerContext;
  recommended: BrandCard[];
  favoritedPartnerIds?: string[];
  affiliateContext?: BrandAffiliateViewerContext;
  affiliatePubliclyVisible?: boolean;
};

const SECTION_CARD =
  "rounded-lg border border-border bg-background p-5 shadow-sm";

function browseCategoryHref(
  department: string | null,
  subcategory?: string,
  isPartner = false
) {
  const basePath = isPartner ? "/" : "/browse-brands";
  const params = new URLSearchParams();
  if (department) params.set("department", department);
  if (subcategory) params.set("subcategory", subcategory);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

const SOCIAL_ICONS: Record<SocialPlatform, string> = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.8-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z",
  facebook:
    "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z",
  linkedin:
    "M4.98 3.5a2.25 2.25 0 1 1-.02 4.5 2.25 2.25 0 0 1 .02-4.5zM3.5 8.75h2.9V21H3.5V8.75zM12 8.75h2.78v1.67h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.47V21H18.1v-6.88c0-1.64-.03-3.75-2.29-3.75-2.29 0-2.64 1.79-2.64 3.63V21h-2.9V8.75z",
  tiktok:
    "M16.6 5.8a4.3 4.3 0 0 1-1-2.8h-3v12.2a2.5 2.5 0 1 1-2.5-2.5c.2 0 .5 0 .7.1V9.7a5.6 5.6 0 0 0-.7 0 5.5 5.5 0 1 0 5.5 5.5V9.3a7.3 7.3 0 0 0 4.2 1.3V7.6a4.3 4.3 0 0 1-3.2-1.8z",
  youtube:
    "M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12zM9.8 15.3V8.7l5.7 3.3z",
};

function AboutBrandSection({ brandStory }: { brandStory: string }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = brandStory.split(/\n{2,}/);
  const isLong =
    paragraphs.length > 1 || brandStory.length > 280 || brandStory.split("\n").length > 5;

  return (
    <section id="about" className={SECTION_CARD}>
      <h2 className="text-sm font-semibold text-foreground">About Us</h2>
      <div
        className={`mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground ${
          expanded ? "" : "line-clamp-5"
        }`}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 text-xs font-semibold text-primary hover:underline"
        >
          {expanded ? "See less ▲" : "See all ▼"}
        </button>
      ) : null}
    </section>
  );
}

function MemberOfferHeadline({ profile }: { profile: PartnerProfile }) {
  if (profile.offerScope === "selected_products") {
    return (
      <p className="text-sm font-bold leading-tight text-primary">
        {profile.discountLabel || "Selected product discounts"}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
      <span className="text-2xl font-extrabold leading-none text-primary">
        {profile.discountPercent
          ? `${profile.discountPercent}%`
          : profile.discountLabel}
      </span>
      {profile.discountPercent ? (
        <span className="pb-0.5 text-xs font-semibold text-foreground">OFF</span>
      ) : null}
    </div>
  );
}

export function PartnerProfileView({
  profile,
  code,
  codeState,
  viewer,
  recommended,
  favoritedPartnerIds = [],
  affiliateContext = { isAffiliate: false, referralUrl: null },
  affiliatePubliclyVisible = false,
}: PartnerProfileViewProps) {
  const favoritedSet = useMemo(
    () => new Set(favoritedPartnerIds),
    [favoritedPartnerIds]
  );

  const categoryBrowseHref = useMemo(
    () => (department: string | null, subcategory?: string) =>
      browseCategoryHref(department, subcategory, viewer.isPartner),
    [viewer.isPartner]
  );

  const browseAllBrandsHref =
    viewer.isPartner || viewer.isActiveMember || viewer.isFreeTrialMember
      ? "/"
      : "/browse-brands";

  const socials = useMemo(
    () =>
      listPartnerSocialLinks({
        instagram: profile.instagram ?? undefined,
        facebook: profile.facebook ?? undefined,
        linkedin: profile.linkedin ?? undefined,
        tiktok: profile.tiktok ?? undefined,
        youtube: profile.youtube ?? undefined,
      }),
    [profile]
  );

  const hasGallery = profile.galleryImageUrls.length > 0;
  const showAffiliate =
    affiliatePubliclyVisible &&
    profile.affiliateEnabled &&
    profile.affiliateCommissionPercent != null;
  const showSelectedProducts =
    profile.offerScope === "selected_products" &&
    profile.selectedProducts.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        {viewer.isOwnProfile &&
        viewer.ownOnboardingState &&
        viewer.ownOnboardingState !== "LIVE" ? (
          <PartnerOnboardingStatusBanner
            state={viewer.ownOnboardingState}
            memberCode={code}
            previewMode
            className="mb-4"
          />
        ) : null}

        {/* Hero + brand header */}
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
              {/* Left: brand info */}
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

                    {profile.shortDescription ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {profile.shortDescription}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {profile.websiteUrl ? (
                        <a
                          href={profile.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="fv-btn-primary inline-flex items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
                        >
                          Visit Website
                          <span aria-hidden="true">&#8599;</span>
                        </a>
                      ) : null}

                      {viewer.canFavorite ? (
                        <FavoriteToggleButton
                          partnerId={profile.id}
                          initialFavorited={viewer.isFavorited}
                        />
                      ) : !viewer.isLoggedIn ? (
                        <Link
                          href="/signup"
                          className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
                        >
                          Save to Favorites
                        </Link>
                      ) : null}
                    </div>

                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Purchases are completed securely on the partner&apos;s own website.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: member exclusive offer */}
              <div
                id="offer"
                className="w-full shrink-0 rounded-lg border border-primary/30 bg-primary/[0.04] p-4 lg:max-w-sm"
              >
                <span className="inline-flex text-[11px] font-bold uppercase tracking-wide text-primary">
                  Member Exclusive Offer
                </span>

                <div className="mt-2">
                  <MemberOfferHeadline profile={profile} />
                </div>

                {profile.offerScope === "entire_store" && profile.offerAppliesTo ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wide">
                      Applies to:{" "}
                    </span>
                    {profile.offerAppliesTo}
                  </p>
                ) : null}

                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Discount Code
                  </p>
                  <DiscountCodeBlock code={code} state={codeState} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-4 space-y-4">
          {profile.brandStory ? (
            <AboutBrandSection brandStory={profile.brandStory} />
          ) : null}

          {showSelectedProducts ? (
            <section id="selected-products" className={SECTION_CARD}>
              <h2 className="text-sm font-semibold text-foreground">
                Selected Products
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                These products qualify for this exclusive member offer.
              </p>
              <div className="mt-3">
                <SelectedProductGrid
                  products={profile.selectedProducts}
                  horizontal
                />
              </div>
            </section>
          ) : null}

          {hasGallery ? (
            <section id="gallery" className={SECTION_CARD}>
              <h2 className="text-sm font-semibold text-foreground">Gallery</h2>
              <div className="mt-3">
                <BrandGallery
                  images={profile.galleryImageUrls}
                  businessName={profile.businessName}
                />
              </div>
            </section>
          ) : null}

          {/* Business info + affiliate */}
          <div
            className={`grid gap-4 ${showAffiliate ? "lg:grid-cols-2" : ""}`}
          >
            <section id="info" className={SECTION_CARD}>
              <h2 className="text-sm font-semibold text-foreground">
                Business Information
              </h2>
              <dl className="mt-3 space-y-3">
                {profile.websiteUrl ? (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Website
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fv-btn-primary inline-flex items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
                      >
                        Visit Website
                        <span aria-hidden="true">&#8599;</span>
                      </a>
                    </dd>
                  </div>
                ) : null}
                {profile.country ? (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Country
                    </dt>
                    <dd className="mt-1 text-xs text-foreground">
                      {profile.country}
                    </dd>
                  </div>
                ) : null}
                {profile.department ? (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Primary Departments
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {profile.departments.map((department) => (
                        <Link
                          key={department}
                          href={categoryBrowseHref(department)}
                          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
                        >
                          {department}
                        </Link>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {profile.categoryGroups.some((group) => group.subcategories.length > 0) ? (
                <PartnerProfileCategories
                  categoryGroups={profile.categoryGroups}
                  browseCategoryHref={categoryBrowseHref}
                />
              ) : null}

              {socials.length > 0 ? (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Follow This Brand
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {socials.map((social) => (
                      <a
                        key={social.platform}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d={SOCIAL_ICONS[social.platform]} />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            {showAffiliate ? (
              <AffiliateProgramProfileSection
                profile={profile}
                businessName={profile.businessName}
                viewerIsAffiliate={affiliateContext.isAffiliate}
                referralUrl={affiliateContext.referralUrl}
              />
            ) : null}
          </div>
        </div>
      </div>

      {recommended.length > 0 ? (
        <section
          aria-labelledby="recommended-brands-heading"
          className="mt-4 border-t border-border bg-background py-6"
        >
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="recommended-brands-heading"
                className="text-sm font-semibold text-foreground"
              >
                You May Also Like
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Discover more participating brands offering exclusive member savings.
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
                href={browseAllBrandsHref}
                className="inline-flex items-center justify-center rounded-sm border-2 border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Browse All Brands
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <ReportProfileTrigger
        brandId={profile.id}
        brandName={profile.businessName}
        isLoggedIn={viewer.isLoggedIn}
        canSubmit={viewer.isLoggedIn && !viewer.isPartner && !viewer.isOwnProfile}
      />
    </div>
  );
}
