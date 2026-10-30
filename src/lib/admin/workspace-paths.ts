export type AdminWorkspace = "foodvault" | "stockup";

const STOCKUP_ADMIN_PREFIXES = [
  "/admin/pantry",
  "/admin/products",
  "/admin/inventory",
  "/admin/vendors",
  "/admin/purchase-orders",
  "/admin/credit-notes",
  "/admin/picker",
  "/admin/orders",
  "/admin/customers",
  "/admin/reports/sales",
  "/admin/reports/inventory",
  "/admin/reports/vendors",
] as const;

const FOODVAULT_ADMIN_PREFIXES = [
  "/admin/partner-applications",
  "/admin/partners",
  "/admin/partner-contacts",
  "/admin/members",
  "/admin/discover",
  "/admin/homepage",
] as const;

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Which admin workspace may open this path. Shared pages are available in both. */
export function adminSection(pathname: string): AdminWorkspace | "shared" | "removed" {
  if (pathname === "/admin/affiliates" || pathname.startsWith("/admin/affiliate")) {
    return "removed";
  }

  if (STOCKUP_ADMIN_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return "stockup";
  }

  if (pathname === "/admin/reports") return "foodvault";

  if (FOODVAULT_ADMIN_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return "foodvault";
  }

  return "shared";
}
