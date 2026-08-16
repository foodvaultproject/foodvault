import {
  getHospitalityDemoVenueById,
  hospitalityLocationLabel,
  hospitalityVenueToBrandCard,
} from "@/lib/hospitality/demo-venues";
import { isHospitalityPreviewId } from "@/lib/hospitality/types";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { FavoritePartner } from "@/lib/member/favorites-queries";

const STORAGE_KEY = "foodvault-hospitality-favorites";

function readIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}

export function listLocalHospitalityFavoriteIds() {
  return readIds();
}

export function isLocalHospitalityFavorited(partnerId: string) {
  return readIds().includes(partnerId);
}

export function toggleLocalHospitalityFavorite(partnerId: string) {
  const current = readIds();
  const nextFavorited = !current.includes(partnerId);
  writeIds(
    nextFavorited
      ? [...current, partnerId]
      : current.filter((id) => id !== partnerId)
  );
  return nextFavorited;
}

export function hospitalityBrandCardToFavorite(
  brand: BrandCard
): FavoritePartner {
  const venue = getHospitalityDemoVenueById(brand.id);
  const now = new Date().toISOString();

  return {
    favoriteId: `local-${brand.id}`,
    partnerId: brand.id,
    savedAt: now,
    businessName: brand.businessName,
    slug: brand.slug,
    primaryCategory: brand.department,
    shortDescription: brand.shortDescription,
    location: brand.locationLabel ?? brand.location,
    discountLabel: brand.discountLabel,
    bannerImageUrl: brand.bannerImageUrl,
    logoUrl: brand.logoUrl,
    logoOriginalUrl: brand.logoOriginalUrl,
    logoCrop: brand.logoCrop,
    websiteUrl: null,
    updatedAt: now,
    partnerCreatedAt: now,
    keywords: `${brand.businessName} ${brand.department ?? ""} ${brand.locationLabel ?? ""}`.toLowerCase(),
    listingModel: "hospitality_venue",
    venueType: brand.venueType ?? venue?.hospitality.venueType,
    locationLabel:
      brand.locationLabel ?? (venue ? hospitalityLocationLabel(venue) : brand.location),
  };
}

export function listLocalHospitalityFavorites(): FavoritePartner[] {
  return readIds()
    .map((id) => {
      const venue = getHospitalityDemoVenueById(id);
      if (!venue) return null;
      return hospitalityBrandCardToFavorite(hospitalityVenueToBrandCard(venue));
    })
    .filter((item): item is FavoritePartner => item !== null);
}

export function shouldUseLocalHospitalityFavorite(partnerId: string) {
  return isHospitalityPreviewId(partnerId);
}
