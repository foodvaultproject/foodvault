import { HOSPITALITY_VENUE_TYPE_LABELS } from "@/lib/hospitality/constants";
import {
  HOSPITALITY_OFFER_CATEGORIES,
  HOSPITALITY_VENUE_TYPES,
  type HospitalityDetails,
  type HospitalityOfferCategory,
  type HospitalityVenueType,
  type ListingModel,
} from "@/lib/hospitality/types";

export type PartnerHospitalityRow = {
  listing_model?: string | null;
  venue_type?: string | null;
  location?: string | null;
  suburb?: string | null;
  city?: string | null;
  region?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  opening_hours?: string | null;
  support_phone?: string | null;
  offer_type?: string | null;
  offer_exclusions?: string | null;
};

function asTrimmed(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function finiteOrNull(value: number | string | null | undefined) {
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseListingModel(value: string | null | undefined): ListingModel {
  return value === "hospitality_venue" ? "hospitality_venue" : "online_brand";
}

export function parseVenueType(value: string | null | undefined): HospitalityVenueType {
  return HOSPITALITY_VENUE_TYPES.includes(value as HospitalityVenueType)
    ? (value as HospitalityVenueType)
    : "cafe";
}

function parseOfferCategory(value: string | null | undefined): HospitalityOfferCategory {
  return HOSPITALITY_OFFER_CATEGORIES.includes(value as HospitalityOfferCategory)
    ? (value as HospitalityOfferCategory)
    : "percentage_off";
}

export function isHospitalityPartnerRow(row: PartnerHospitalityRow) {
  if (parseListingModel(row.listing_model) === "hospitality_venue") {
    return true;
  }

  return Boolean(
    asTrimmed(row.suburb) ||
      asTrimmed(row.city) ||
      finiteOrNull(row.latitude) != null
  );
}

export function hospitalityDetailsFromPartnerRow(
  row: PartnerHospitalityRow
): HospitalityDetails {
  const venueType = parseVenueType(row.venue_type);

  return {
    venueType,
    location: {
      street: "",
      suburb: asTrimmed(row.suburb),
      city: asTrimmed(row.city),
      region: asTrimmed(row.region),
      lat: finiteOrNull(row.latitude),
      lng: finiteOrNull(row.longitude),
      displayName: asTrimmed(row.location),
    },
    openingHours: asTrimmed(row.opening_hours),
    phone: asTrimmed(row.support_phone),
    offerCategory: parseOfferCategory(row.offer_type),
    offerTitle: asTrimmed(row.offer_type),
    offerTerms: asTrimmed(row.offer_exclusions),
    redemptionCap: "once_per_visit",
  };
}

export function hospitalityDepartmentLabel(venueType: HospitalityVenueType) {
  return HOSPITALITY_VENUE_TYPE_LABELS[venueType];
}
