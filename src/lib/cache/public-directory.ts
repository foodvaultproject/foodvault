import { unstable_cache } from "next/cache";
import { PUBLIC_CACHE_TAG, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/revalidate";
import { getDiscoverPageContent, getDiscoverArticlePageData, getPublishedArticleBySlug } from "@/lib/discover/queries";
import {
  getFeaturedBrands,
  getHomepageFeaturedBrands,
  getPartnerLogos,
  getRecentBrandCards,
  getTrendingThisWeekBrands,
  searchPublicBrands,
} from "@/lib/member/browse-brands";
import type { BrandSearchParams } from "@/lib/member/browse-brands-types";
import { getHomeExploreGalleryItems } from "@/lib/member/home-explore-gallery";
import { searchHospitalityVenues } from "@/lib/hospitality/search";
import {
  getPartnerProfile,
  getRecommendedBrands,
} from "@/lib/member/partner-profile";
import { getMembershipSettings } from "@/lib/member/settings";
import { getHomeVaultDrops } from "@/lib/vault-drop-data";
import { createPublicReadClient } from "@/lib/supabase/public-read";
import { isSupabaseConfigured } from "@/lib/auth";

function stableParamsKey(params: BrandSearchParams): string {
  return JSON.stringify({
    sort: params.sort ?? "featured",
    department: params.department ?? null,
    departments: params.departments ?? [],
    subcategory: params.subcategory ?? null,
    subcategories: params.subcategories ?? [],
    dietaryLifestyle: params.dietaryLifestyle ?? null,
    dietaryLifestyles: params.dietaryLifestyles ?? [],
    search: params.search ?? null,
    minDiscount: params.minDiscount ?? null,
    limit: params.limit ?? null,
    offset: params.offset ?? null,
  });
}

export const getCachedHomeExploreGalleryItems = unstable_cache(
  async () => getHomeExploreGalleryItems(),
  ["cached-home-explore-gallery-items"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAG.exploreGallery],
  }
);

export const getCachedDiscoverPageContent = unstable_cache(
  async () => getDiscoverPageContent(),
  ["cached-discover-page-content"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAG.discover],
  }
);

export async function getCachedPublishedArticleBySlug(slug: string) {
  return unstable_cache(
    async () => getPublishedArticleBySlug(slug),
    ["cached-discover-article", slug],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.discover, `discover-article-${slug}`],
    }
  )();
}

export const getCachedMembershipSettings = unstable_cache(
  async () => getMembershipSettings(),
  ["cached-membership-settings"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAG.membershipSettings],
  }
);

export async function getCachedHomeVaultDrops(limit: number) {
  return unstable_cache(
    async () => getHomeVaultDrops(limit),
    ["cached-home-vault-drops", String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.vaultDrops],
    }
  )();
}

export async function getCachedFeaturedBrands(limit: number) {
  return unstable_cache(
    async () => getFeaturedBrands(limit),
    ["cached-featured-brands-v2", String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.brands],
    }
  )();
}

export async function getCachedHomepageFeaturedBrands(limit: number) {
  return unstable_cache(
    async () => getHomepageFeaturedBrands(limit),
    ["cached-homepage-featured-brands-v3", String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.brands],
    }
  )();
}

export async function getCachedRecentBrandCards(limit: number) {
  return unstable_cache(
    async () => getRecentBrandCards(limit),
    ["cached-recent-brand-cards-v3", String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.brands],
    }
  )();
}

export async function getCachedHospitalityVenues(limit: number) {
  return unstable_cache(
    async () =>
      searchHospitalityVenues({
        sort: "featured",
        limit,
        offset: 0,
      }),
    ["cached-hospitality-venues-v1", String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.brands],
    }
  )();
}

export const getCachedTrendingThisWeekBrands = unstable_cache(
  async () => getTrendingThisWeekBrands(),
  ["cached-trending-this-week-brands"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAG.brands],
  }
);

export async function getCachedSearchPublicBrands(params: BrandSearchParams) {
  const key = stableParamsKey(params);

  return unstable_cache(
    async () => searchPublicBrands(params),
    ["cached-search-public-brands", key],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.brands],
    }
  )();
}

export async function getCachedPartnerProfile(slug: string) {
  const normalized = slug.trim().toLowerCase();
  const profile = await getPartnerProfile(normalized);

  // Never negative-cache missing profiles — new listings go live after deploy.
  if (!profile) {
    return null;
  }

  return unstable_cache(
    async () => getPartnerProfile(normalized),
    ["cached-partner-profile-v2", normalized],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.partnerProfile, `partner-profile-${normalized}`],
    }
  )();
}

export async function getCachedRecommendedBrands(
  partnerId: string,
  slug: string,
  limit: number
) {
  const profile = await getCachedPartnerProfile(slug);
  if (!profile) return [];

  return unstable_cache(
    async () => getRecommendedBrands(partnerId, profile, limit),
    ["cached-recommended-brands-v2", partnerId, String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.brands, PUBLIC_CACHE_TAG.partnerProfile],
    }
  )();
}

export async function getCachedPartnerLogos(limit: number) {
  return unstable_cache(
    async () => getPartnerLogos(limit),
    ["cached-partner-logos", String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.brands],
    }
  )();
}

export async function getCachedDiscoverArticlePageData(slug: string) {
  return unstable_cache(
    async () => getDiscoverArticlePageData(slug),
    ["cached-discover-article-page", slug],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAG.discover, `discover-article-${slug}`],
    }
  )();
}

export async function getCachedDiscoverArticleSlugs() {
  const content = await getCachedDiscoverPageContent();
  const slugs = new Set<string>();

  if (content.featured?.slug) {
    slugs.add(content.featured.slug);
  }

  for (const articles of Object.values(content.byCategory)) {
    for (const article of articles) {
      if (article.slug) {
        slugs.add(article.slug);
      }
    }
  }

  return [...slugs];
}

export const getCachedPublicBrandSlugs = unstable_cache(
  async () => {
    if (!isSupabaseConfigured()) {
      return [] as string[];
    }

    const supabase = createPublicReadClient();
    if (!supabase) {
      return [] as string[];
    }

    const { data, error } = await supabase
      .from("v_public_brand_profile")
      .select("slug")
      .not("slug", "is", null);

    if (error || !data?.length) {
      return [] as string[];
    }

    return data
      .map((row) => String(row.slug ?? "").trim())
      .filter(Boolean);
  },
  ["cached-public-brand-slugs-v2"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAG.brands, PUBLIC_CACHE_TAG.partnerProfile],
  }
);
