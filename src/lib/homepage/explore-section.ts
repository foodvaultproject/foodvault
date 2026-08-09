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
