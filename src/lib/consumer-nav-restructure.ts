/** Consumer Home / Search / Explore navigation and dedicated explore feed. */
export function isConsumerNavRestructureEnabled(): boolean {
  return true;
}

export const CONSUMER_HOME_PATH = "/";
export const CONSUMER_SEARCH_PATH = "/search";
export const CONSUMER_EXPLORE_PATH = "/explore";
/** Direct supermarket storefront. `/` must not be used as a startsWith prefix. */
export const CONSUMER_VAULT_MARKET_PATH = "/";
export const CONSUMER_PARTNER_DIRECTORY_PATH = "/vault-market";
export const STOREFRONT_CHECKOUT_PATH = "/checkout";
export const STOREFRONT_GROCERY_LIST_PATH = "/list";
export const STOREFRONT_ORDER_SUCCESS_PATH = "/order-success";
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

export function isPartnerDirectoryPath(pathname: string): boolean {
  return (
    pathname === CONSUMER_PARTNER_DIRECTORY_PATH ||
    pathname.startsWith(`${CONSUMER_PARTNER_DIRECTORY_PATH}/`)
  );
}

const STOREFRONT_NESTED_PATHS = [
  STOREFRONT_CHECKOUT_PATH,
  STOREFRONT_GROCERY_LIST_PATH,
  STOREFRONT_ORDER_SUCCESS_PATH,
] as const;

/** App routes that must not be treated as supermarket department slugs. */
const RESERVED_ROOT_SEGMENTS = new Set([
  "account",
  "admin",
  "affiliate",
  "affiliate-program",
  "affiliate-terms",
  "about",
  "api",
  "auth",
  "browse-brands",
  "brands",
  "checkout",
  "contact",
  "cookies",
  "dashboard",
  "discover",
  "explore",
  "faq",
  "favorites",
  "for-brands",
  "forgot-password",
  "go",
  "how-it-works",
  "list",
  "login",
  "membership",
  "order-success",
  "partner",
  "partner-application",
  "partner-login",
  "partners",
  "pricing",
  "privacy",
  "refund-policy",
  "reset-password",
  "search",
  "signup",
  "terms",
  "vault-market",
]);

export function isVaultMarketPath(pathname: string): boolean {
  if (isPartnerDirectoryPath(pathname)) return false;
  if (pathname === CONSUMER_VAULT_MARKET_PATH) return true;

  if (CONSUMER_VAULT_MARKET_PATH !== "/") {
    return pathname.startsWith(`${CONSUMER_VAULT_MARKET_PATH}/`);
  }

  if (
    STOREFRONT_NESTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    return true;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 3) return false;
  return !RESERVED_ROOT_SEGMENTS.has(segments[0]);
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
