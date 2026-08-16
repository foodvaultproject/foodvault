import { MAX_HOSPITALITY_GALLERY_IMAGES } from "@/lib/hospitality/constants";
import {
  formatHospitalityAddress,
  type HospitalityApplicationDetails,
} from "@/lib/hospitality/types";

export function validateHospitalityApplication(
  details: HospitalityApplicationDetails,
  options: { galleryImageCount: number }
): { ok: true } | { ok: false; message: string } {
  if (!details.venueType) {
    return { ok: false, message: "Please choose a venue type." };
  }

  if (!formatHospitalityAddress(details.location)) {
    return {
      ok: false,
      message: "Please search and select a physical address for your venue.",
    };
  }

  if (!details.location.city.trim() && !details.location.suburb.trim()) {
    return {
      ok: false,
      message: "Please include a suburb or city so members can find you.",
    };
  }

  if (!details.openingHours.trim()) {
    return { ok: false, message: "Please add your opening hours." };
  }

  if (!details.phone.trim()) {
    return { ok: false, message: "Please add a phone number for your venue." };
  }

  if (!details.offerCategory) {
    return { ok: false, message: "Please choose an offer category." };
  }

  if (!details.offerTitle.trim()) {
    return { ok: false, message: "Please add a short offer title." };
  }

  if (!details.offerTerms.trim()) {
    return { ok: false, message: "Please add offer terms and conditions." };
  }

  if (options.galleryImageCount < 1) {
    return {
      ok: false,
      message: "Please upload at least one photo of your venue.",
    };
  }

  if (options.galleryImageCount > MAX_HOSPITALITY_GALLERY_IMAGES) {
    return {
      ok: false,
      message: `Please upload no more than ${MAX_HOSPITALITY_GALLERY_IMAGES} photos.`,
    };
  }

  return { ok: true };
}
