import type {
  HospitalityOfferCategory,
  HospitalityVenueType,
} from "@/lib/hospitality/types";

export const NZ_REGIONS = [
  "Northland",
  "Auckland",
  "Waikato",
  "Bay of Plenty",
  "Gisborne",
  "Hawke's Bay",
  "Taranaki",
  "Manawatū-Whanganui",
  "Wellington",
  "Tasman",
  "Nelson",
  "Marlborough",
  "West Coast",
  "Canterbury",
  "Otago",
  "Southland",
] as const;

export type NzRegion = (typeof NZ_REGIONS)[number];

export const HOSPITALITY_HOME_REGION_CHIPS = [
  { id: "auckland", label: "Auckland", region: "Auckland" },
  { id: "wellington", label: "Wellington", region: "Wellington" },
  { id: "christchurch", label: "Christchurch", region: "Canterbury", city: "Christchurch" },
  { id: "other", label: "Other Regions", region: "other" },
] as const;

export const HOSPITALITY_VENUE_TYPE_LABELS: Record<
  HospitalityVenueType,
  string
> = {
  cafe: "Cafe",
  restaurant: "Restaurant",
  bakery: "Bakery",
  deli: "Deli",
};

export const HOSPITALITY_OFFER_CATEGORY_LABELS: Record<
  HospitalityOfferCategory,
  string
> = {
  percentage_off: "Percentage Off",
  free_item: "Free Item",
  special_bundle: "Special Bundle",
  exclusive_perk: "Exclusive Perk",
};

export const HOSPITALITY_REDEMPTION_CAP_LABEL = "Once per visit / transaction";

export const MAX_HOSPITALITY_GALLERY_IMAGES = 10;
export const MIN_HOSPITALITY_GALLERY_IMAGES = 3;
export const MAX_HOSPITALITY_OFFER_IMAGES = 5;
export const MAX_HOSPITALITY_PROFILE_GALLERY_IMAGES = 12;

export const NOMINATIM_COUNTRY_CODES = "nz";

const REGION_ALIASES: Record<string, NzRegion> = {
  "greater wellington": "Wellington",
  "wellington region": "Wellington",
  "auckland region": "Auckland",
  "canterbury region": "Canterbury",
  "otago region": "Otago",
  "bay of plenty region": "Bay of Plenty",
  "hawkes bay": "Hawke's Bay",
  "hawke’s bay": "Hawke's Bay",
  "manawatu-whanganui": "Manawatū-Whanganui",
  "manawatū-wanganui": "Manawatū-Whanganui",
  "manawatu-wanganui": "Manawatū-Whanganui",
};

export function normalizeNzRegion(value: string | null | undefined): NzRegion | "" {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";

  const exact = NZ_REGIONS.find(
    (region) => region.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact;

  const alias = REGION_ALIASES[trimmed.toLowerCase()];
  return alias ?? "";
}

export function isMainHospitalityRegion(region: string) {
  return region === "Auckland" || region === "Wellington" || region === "Canterbury";
}
