import { isVaultMarketPath } from "@/lib/consumer-nav-restructure";

export type AppMode = "stockup" | "foodvault";

export const STOCKUP_ORIGIN = "https://www.stockup.co.nz";
export const FOODVAULT_ORIGIN = "https://www.foodvault.co.nz";

const STOCKUP_HOSTS = new Set(["stockup.co.nz", "www.stockup.co.nz"]);
const FOODVAULT_HOSTS = new Set(["foodvault.co.nz", "www.foodvault.co.nz"]);

const DIRECTORY_PREFIXES = ["/vault-market", "/brands", "/partners", "/browse-brands"];

export function normalizeHost(host: string | null | undefined): string {
  const first = (host ?? "").split(",")[0]?.trim() ?? "";
  return first.split(":")[0].trim().toLowerCase();
}

/** Site mode for this deployment. A known production host wins over the env var. */
export function getAppMode(host?: string | null): AppMode {
  const hostname = normalizeHost(host);
  if (STOCKUP_HOSTS.has(hostname)) return "stockup";
  if (FOODVAULT_HOSTS.has(hostname)) return "foodvault";

  const configured = process.env.NEXT_PUBLIC_APP_MODE?.trim().toLowerCase();
  if (configured === "foodvault" || configured === "stockup") return configured;
  return "stockup";
}

export function isStockupMode(host?: string | null): boolean {
  return getAppMode(host) === "stockup";
}

export function canonicalSiteOrigin(mode: AppMode = getAppMode()): string {
  return mode === "stockup" ? STOCKUP_ORIGIN : FOODVAULT_ORIGIN;
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

export function crossDomainRedirect(
  mode: AppMode,
  pathname: string,
  search = ""
): string | null {
  if (pathname.startsWith("/api") || pathname.startsWith("/admin")) return null;

  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";

  if (mode === "stockup" && isDirectoryRoute(pathname)) {
    return `${FOODVAULT_ORIGIN}${pathname}${query}`;
  }

  if (mode === "foodvault" && (pathname === "/pantry" || pathname.startsWith("/pantry/"))) {
    const stripped = pathname.replace(/^\/pantry/, "") || "/";
    return `${STOCKUP_ORIGIN}${stripped}${query}`;
  }

  if (mode === "foodvault" && isSupermarketRoute(pathname)) {
    return `${STOCKUP_ORIGIN}${pathname}${query}`;
  }

  return null;
}

export function isSupermarketOrderMetadata<
  T extends { stockup?: string | null; foodvault?: string | null },
>(metadata: T | null | undefined): metadata is T {
  if (!metadata) return false;
  return metadata.stockup === "supermarket_order" || metadata.foodvault === "vault_market";
}
