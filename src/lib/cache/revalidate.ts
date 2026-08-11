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
