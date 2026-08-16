import { normalizeNzRegion } from "@/lib/hospitality/constants";
import {
  formatHospitalityAddress,
  type HospitalityLocation,
} from "@/lib/hospitality/types";

export type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  region?: string;
  postcode?: string;
};

export type NominatimSearchHit = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
};

export function hospitalityLocationFromNominatim(
  hit: NominatimSearchHit
): HospitalityLocation {
  const address = hit.address ?? {};
  const street = [address.house_number, address.road ?? address.pedestrian]
    .filter(Boolean)
    .join(" ");
  const suburb =
    address.suburb ?? address.neighbourhood ?? address.city_district ?? "";
  const city = address.city ?? address.town ?? address.village ?? "";
  const postcode = address.postcode?.trim() ?? "";
  const location: HospitalityLocation = {
    street,
    suburb,
    city,
    region: normalizeNzRegion(address.state ?? address.region ?? ""),
    lat: hit.lat ? Number(hit.lat) : null,
    lng: hit.lon ? Number(hit.lon) : null,
    displayName: [street, suburb, city, postcode, hit.display_name]
      .map((part) => part?.trim() ?? "")
      .filter(Boolean)
      .join(", "),
  };

  return {
    ...location,
    displayName: formatHospitalityAddress(location),
  };
}
