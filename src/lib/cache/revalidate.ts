import { revalidatePath, revalidateTag } from "next/cache";

/** Shared ISR window for public marketing and directory surfaces. */
export const PUBLIC_REVALIDATE_SECONDS = 86_400;

export const PUBLIC_EDGE_CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";

export const PUBLIC_CACHE_TAG = {
  brands: "public-brands",
  exploreGallery: "public-explore-gallery",
  discover: "public-discover",
  membershipSettings: "membership-settings",
  vaultDrops: "public-vault-drops",
  partnerProfile: "public-partner-profile",
} as const;

/** Bust ISR caches when a partner listing goes live, changes, or is removed. */
export function revalidatePublicBrandDirectory(options?: { slug?: string | null }) {
  revalidateTag(PUBLIC_CACHE_TAG.brands, { expire: 0 });
  revalidateTag(PUBLIC_CACHE_TAG.exploreGallery, { expire: 0 });
  revalidateTag(PUBLIC_CACHE_TAG.partnerProfile, { expire: 0 });
  revalidateTag(PUBLIC_CACHE_TAG.vaultDrops, { expire: 0 });

  revalidatePath("/", "layout");
  revalidatePath("/search");
  revalidatePath("/explore");
  revalidatePath("/partners");
  revalidatePath("/browse-brands");
  revalidatePath("/sitemap.xml");

  const slug = options?.slug?.trim().toLowerCase();
  if (slug) {
    revalidateTag(`partner-profile-${slug}`, { expire: 0 });
    revalidatePath(`/brands/${slug}`);
  }
}
