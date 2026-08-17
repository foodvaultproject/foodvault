import {
  emptyWeeklySchedule,
  serializeWeeklySchedule,
} from "@/lib/hospitality/hours";

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
  offerDescription: string;
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
  offerDescription: string;
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
    openingHours: serializeWeeklySchedule(emptyWeeklySchedule()),
    phone: "",
    offerCategory: "",
    offerTitle: "",
    offerDescription: "",
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
    return `${suburb}, ${city}`;
  }
  return suburb || city || "";
}

const NZ_REGION_NAMES = new Set([
  "northland",
  "auckland",
  "waikato",
  "bay of plenty",
  "gisborne",
  "hawke's bay",
  "hawkes bay",
  "hawke’s bay",
  "taranaki",
  "manawatu-whanganui",
  "manawatū-whanganui",
  "manawatu-wanganui",
  "wellington",
  "tasman",
  "nelson",
  "marlborough",
  "west coast",
  "canterbury",
  "otago",
  "southland",
  "auckland region",
  "wellington region",
  "canterbury region",
  "otago region",
  "greater wellington",
]);

export function extractNzPostcode(value: string) {
  const matches = value.match(/\b\d{4}\b/g);
  return matches?.[matches.length - 1] ?? "";
}

export function cleanHospitalityDisplayAddress(raw: string) {
  let value = raw.trim();
  if (!value) return "";

  value = value
    .replace(/\s*\/\s*Aotearoa\b/gi, "")
    .replace(/,?\s*\bAotearoa\b/gi, "")
    .replace(/,?\s*\bNew Zealand\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,(?:,|\s)+/g, ", ")
    .replace(/^,\s*|\s*,$/g, "")
    .trim();

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^(new zealand|aotearoa|nz)$/i.test(part));

  let postcode = "";
  if (parts.length && /^\d{4}$/.test(parts[parts.length - 1])) {
    postcode = parts.pop() ?? "";
  } else {
    const maybe = extractNzPostcode(parts[parts.length - 1] ?? "");
    if (maybe && parts.length) {
      parts[parts.length - 1] = parts[parts.length - 1]
        .replace(new RegExp(`\\b${maybe}\\b`), "")
        .trim();
      postcode = maybe;
    }
  }

  if (
    parts.length > 2 &&
    NZ_REGION_NAMES.has(parts[parts.length - 1].toLowerCase())
  ) {
    parts.pop();
  }

  if (postcode && parts.length && !parts[parts.length - 1].includes(postcode)) {
    parts[parts.length - 1] = `${parts[parts.length - 1]} ${postcode}`;
  }

  return parts.filter(Boolean).join(", ");
}

export function formatHospitalityAddress(location: HospitalityLocation) {
  const cleanedDisplay = cleanHospitalityDisplayAddress(location.displayName);
  const street = location.street.trim();
  const suburb = location.suburb.trim();
  const city = location.city.trim();
  const postcode = extractNzPostcode(cleanedDisplay);

  if (street) {
    const cityLine = [city, postcode].filter(Boolean).join(" ");
    const parts: string[] = [street];
    if (suburb && suburb.toLowerCase() !== city.toLowerCase()) {
      parts.push(suburb);
    }
    if (cityLine && cityLine.toLowerCase() !== suburb.toLowerCase()) {
      parts.push(cityLine);
    }
    return parts.filter(Boolean).join(", ");
  }

  return (
    cleanedDisplay ||
    [suburb, city].map((part) => part.trim()).filter(Boolean).join(", ")
  );
}
