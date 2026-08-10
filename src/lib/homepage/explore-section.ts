import { isConsumerNavRestructureEnabled } from "@/lib/consumer-nav-restructure";

/** Homepage Explore & Save gallery section. Disabled when moved to /explore. */
export function isHomeExploreSectionEnabled(): boolean {
  if (isConsumerNavRestructureEnabled()) {
    return false;
  }

  return true;
}

export const HOME_EXPLORE_PAGE_SIZE = 60;
export const HOME_EXPLORE_IMAGES_PER_BRAND = 3;

/** Localhost /explore feed uses every partner gallery image instead of a small sample. */
export function useFullExploreGalleryOnLocalhost(): boolean {
  return process.env.NODE_ENV === "development";
}
