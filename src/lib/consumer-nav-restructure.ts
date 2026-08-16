/** Consumer Home / Search / Explore navigation and dedicated explore feed. */
export function isConsumerNavRestructureEnabled(): boolean {
  return true;
}

export const CONSUMER_HOME_PATH = "/";
export const CONSUMER_SEARCH_PATH = "/search";
export const CONSUMER_EXPLORE_PATH = "/explore";
export const LEGACY_BROWSE_PATH = "/browse-brands";

export const CONSUMER_BROWSE_PATHS = new Set([
  LEGACY_BROWSE_PATH,
  CONSUMER_SEARCH_PATH,
]);

export function consumerSearchPath(): string {
  return isConsumerNavRestructureEnabled()
    ? CONSUMER_SEARCH_PATH
    : LEGACY_BROWSE_PATH;
}

export function consumerSearchLabel(): string {
  return isConsumerNavRestructureEnabled() ? "Search" : "Discover";
}

export function isSearchPath(pathname: string): boolean {
  return (
    pathname === CONSUMER_SEARCH_PATH ||
    pathname.startsWith(`${CONSUMER_SEARCH_PATH}/`) ||
    pathname === LEGACY_BROWSE_PATH ||
    pathname.startsWith(`${LEGACY_BROWSE_PATH}/`)
  );
}

export function isExplorePath(pathname: string): boolean {
  return (
    pathname === CONSUMER_EXPLORE_PATH ||
    pathname.startsWith(`${CONSUMER_EXPLORE_PATH}/`)
  );
}

export function isConsumerHomePath(pathname: string): boolean {
  return pathname === CONSUMER_HOME_PATH;
}

export function shouldShowConsumerSecondaryNav(pathname: string): boolean {
  if (!isConsumerNavRestructureEnabled()) {
    return false;
  }

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/partner/") ||
    pathname.startsWith("/affiliate/")
  ) {
    return false;
  }

  return true;
}

export function buildConsumerSearchHref(query?: {
  department?: string;
  subcategory?: string;
  mode?: "online" | "local";
  region?: string;
  city?: string;
  venueType?: string;
}): string {
  const base = consumerSearchPath();
  const params = new URLSearchParams();
  if (query?.department) params.set("department", query.department);
  if (query?.subcategory) params.set("subcategory", query.subcategory);
  if (query?.mode) params.set("mode", query.mode);
  if (query?.region) params.set("region", query.region);
  if (query?.city) params.set("city", query.city);
  if (query?.venueType) params.set("venueType", query.venueType);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
