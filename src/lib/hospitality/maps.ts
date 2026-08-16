import {
  formatHospitalityAddress,
  type HospitalityLocation,
} from "@/lib/hospitality/types";

export function hospitalityDirectionsHref(location: HospitalityLocation) {
  if (location.lat != null && location.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  }

  const query = encodeURIComponent(formatHospitalityAddress(location));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function hospitalityOpenStreetMapHref(location: HospitalityLocation) {
  if (location.lat != null && location.lng != null) {
    return `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=16/${location.lat}/${location.lng}`;
  }

  const query = encodeURIComponent(formatHospitalityAddress(location));
  return `https://www.openstreetmap.org/search?query=${query}`;
}
