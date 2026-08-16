export const LISTING_MODELS = ["online_brand", "hospitality_venue"] as const;
export type ListingModel = (typeof LISTING_MODELS)[number];

export const HOSPITALITY_VENUE_TYPES = [
  "cafe",
  "restaurant",
  "bakery",
  "deli",
] as const;
export type HospitalityVenueType = (typeof HOSPITALITY_VENUE_TYPES)[number];

export const HOSPITALITY_OFFER_CATEGORIES = [
  "percentage_off",
  "free_item",
  "special_bundle",
  "exclusive_perk",
] as const;
export type HospitalityOfferCategory =
  (typeof HOSPITALITY_OFFER_CATEGORIES)[number];

export const HOSPITALITY_REDEMPTION_CAPS = ["once_per_visit"] as const;
export type HospitalityRedemptionCap =
  (typeof HOSPITALITY_REDEMPTION_CAPS)[number];

export type HospitalityLocation = {
  street: string;
  suburb: string;
  city: string;
  region: string;
  lat: number | null;
  lng: number | null;
  displayName: string;
};

export type HospitalityDetails = {
  venueType: HospitalityVenueType;
  location: HospitalityLocation;
  openingHours: string;
  phone: string;
  offerCategory: HospitalityOfferCategory;
  offerTitle: string;
  offerTerms: string;
  redemptionCap: HospitalityRedemptionCap;
};

export type HospitalityApplicationDetails = {
  venueType: HospitalityVenueType | "";
  location: HospitalityLocation;
  openingHours: string;
  phone: string;
  offerCategory: HospitalityOfferCategory | "";
  offerTitle: string;
  offerTerms: string;
  redemptionCap: HospitalityRedemptionCap;
};

export type DiscoveryMode = "online" | "local";

export function isHospitalityPreviewId(id: string) {
  return id.startsWith("hosp-");
}

export function isHospitalityListing(
  listingModel?: ListingModel | null
): listingModel is "hospitality_venue" {
  return listingModel === "hospitality_venue";
}

export function emptyHospitalityLocation(): HospitalityLocation {
  return {
    street: "",
    suburb: "",
    city: "",
    region: "",
    lat: null,
    lng: null,
    displayName: "",
  };
}

export function emptyHospitalityApplicationDetails(): HospitalityApplicationDetails {
  return {
    venueType: "",
    location: emptyHospitalityLocation(),
    openingHours: "",
    phone: "",
    offerCategory: "",
    offerTitle: "",
    offerTerms: "",
    redemptionCap: "once_per_visit",
  };
}

export function formatHospitalityLocationLabel(
  location: Pick<HospitalityLocation, "suburb" | "city">
) {
  const suburb = location.suburb.trim();
  const city = location.city.trim();
  if (suburb && city && suburb.toLowerCase() !== city.toLowerCase()) {
    return `${suburb}`;
  }
  return suburb || city || "";
}

export function formatHospitalityAddress(location: HospitalityLocation) {
  return (
    location.displayName.trim() ||
    [location.street, location.suburb, location.city, location.region]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ")
  );
}
