import { isVaultMarketPath } from "@/lib/consumer-nav-restructure";
import {
  FOODVAULT_EXACT_ROUTES,
  FOODVAULT_GUARDED_PREFIXES,
  FOODVAULT_HOSTS,
  FOODVAULT_ORIGIN,
  STOCKUP_GUARDED_PREFIXES,
  STOCKUP_HOSTS,
  STOCKUP_ORIGIN,
} from "@/lib/mode-routes";

export type AppMode = "stockup" | "foodvault";
export type RouteOwner = "shared" | AppMode;

export { FOODVAULT_ORIGIN, STOCKUP_ORIGIN };

const STOCKUP_HOST_SET = new Set<string>(STOCKUP_HOSTS);
const FOODVAULT_HOST_SET = new Set<string>(FOODVAULT_HOSTS);

const DIRECTORY_PREFIXES = ["/vault-market", "/brands", "/partners", "/browse-brands"];

export function normalizeHost(host: string | null | undefined): string {
  const first = (host ?? "").split(",")[0]?.trim() ?? "";
  return first.split(":")[0].trim().toLowerCase();
}

/** Site mode for this deployment. A known production host wins over APP_MODE. */
export function getAppMode(host?: string | null): AppMode {
  const hostname = normalizeHost(host);
  if (STOCKUP_HOST_SET.has(hostname)) return "stockup";
  if (FOODVAULT_HOST_SET.has(hostname)) return "foodvault";

  const configured = process.env.APP_MODE?.toLowerCase();
  if (configured === "stockup") return "stockup";
  return "foodvault";
}

export function isStockupMode(host?: string | null): boolean {
  return getAppMode(host) === "stockup";
}

export function canonicalSiteOrigin(mode: AppMode = getAppMode()): string {
  return mode === "stockup" ? STOCKUP_ORIGIN : FOODVAULT_ORIGIN;
}

export function requestHost(request: {
  headers: { get(name: string): string | null };
}): string {
  return normalizeHost(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  );
}

/** Public site that received this request, not an internal deployment URL. */
export function requestSiteOrigin(request: {
  headers: { get(name: string): string | null };
  url: string;
}): string {
  const host = requestHost(request);
  if (STOCKUP_HOST_SET.has(host)) return STOCKUP_ORIGIN;
  if (FOODVAULT_HOST_SET.has(host)) return FOODVAULT_ORIGIN;
  if (!host) return new URL(request.url).origin;
  const proto =
    (request.headers.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim() ||
    "https";
  return `${proto}://${host}`;
}

/** Keep a StockUp signup off FoodVault-only pages such as membership checkout. */
export function stockupSafePath(path: string | null | undefined): string {
  const trimmed = (path ?? "").trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  const pathname = trimmed.split("?")[0] || "/";
  if (routeOwner(pathname) === "foodvault") return "/";
  return trimmed;
}

/**
 * Confirmation links tagged for StockUp must be opened on stockup.co.nz
 * before the token is consumed, so the login cookie is set on that site.
 */
export function stockupLinkBounce(request: {
  headers: { get(name: string): string | null };
  url: string;
}): string | null {
  const url = new URL(request.url);
  if (url.searchParams.get("brand") !== "stockup") return null;
  if (url.searchParams.get("bounced") === "1") return null;
  if (STOCKUP_HOST_SET.has(normalizeHost(url.host))) return null;
  if (getAppMode(requestHost(request)) === "stockup") return null;
  url.searchParams.set("bounced", "1");
  return `${STOCKUP_ORIGIN}${url.pathname}?${url.searchParams.toString()}`;
}

export function siteDisplayName(mode: AppMode = getAppMode()): string {
  return mode === "stockup" ? "StockUp" : "FoodVault";
}

export function isDirectoryRoute(pathname: string): boolean {
  return DIRECTORY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Supermarket pages that must not stay on the FoodVault directory host. `/` is the directory there. */
export function isSupermarketRoute(pathname: string): boolean {
  if (pathname === "/pantry" || pathname.startsWith("/pantry/")) return true;
  if (pathname === "/") return false;
  return isVaultMarketPath(pathname);
}

/** Same-site leftovers that must not run as global redirects, or they fire before the other host can leave. */
export function legacyLocalRedirect(mode: AppMode, pathname: string): string | null {
  if (mode === "stockup" && (pathname === "/pantry" || pathname.startsWith("/pantry/"))) {
    return pathname.replace(/^\/pantry/, "") || "/";
  }

  if (
    mode === "foodvault" &&
    (pathname === "/partners" ||
      pathname.startsWith("/partners/") ||
      pathname === "/browse-brands" ||
      pathname.startsWith("/browse-brands/"))
  ) {
    return "/vault-market";
  }

  return null;
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Which deployment may render this path. Shared routes stay on both hosts. */
export function routeOwner(pathname: string): RouteOwner {
  if (pathname.startsWith("/api")) return "shared";

  if ((FOODVAULT_EXACT_ROUTES as readonly string[]).includes(pathname)) return "foodvault";

  if (STOCKUP_GUARDED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return "stockup";
  }

  if (FOODVAULT_GUARDED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return "foodvault";
  }

  if (isSupermarketRoute(pathname)) return "stockup";

  return "shared";
}

export function linkVisibleInMode(href: string, mode: AppMode = getAppMode()): boolean {
  const path = href.split("?")[0] || "/";
  const owner = routeOwner(path);
  return owner === "shared" || owner === mode;
}

export function crossDomainRedirect(
  mode: AppMode,
  pathname: string,
  search = ""
): string | null {
  if (pathname.startsWith("/api")) return null;
  // One admin login can open either brand. Do not bounce admin pages to the other host.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  const owner = routeOwner(pathname);
  if (owner === "shared" || owner === mode) return null;

  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  const origin = owner === "stockup" ? STOCKUP_ORIGIN : FOODVAULT_ORIGIN;

  if (owner === "stockup" && (pathname === "/pantry" || pathname.startsWith("/pantry/"))) {
    const stripped = pathname.replace(/^\/pantry/, "") || "/";
    return `${origin}${stripped}${query}`;
  }

  return `${origin}${pathname}${query}`;
}

export function isSupermarketOrderMetadata<
  T extends { stockup?: string | null; foodvault?: string | null },
>(metadata: T | null | undefined): metadata is T {
  if (!metadata) return false;
  return metadata.stockup === "supermarket_order" || metadata.foodvault === "vault_market";
}
