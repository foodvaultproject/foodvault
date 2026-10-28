export const STOCKUP_ORIGIN = "https://www.stockup.co.nz";
export const FOODVAULT_ORIGIN = "https://www.foodvault.co.nz";

export const STOCKUP_HOSTS = ["stockup.co.nz", "www.stockup.co.nz"] as const;
export const FOODVAULT_HOSTS = ["foodvault.co.nz", "www.foodvault.co.nz"] as const;

/** Routes that belong only on StockUp. Matched exactly or as a path prefix. */
export const STOCKUP_GUARDED_PREFIXES = [
  "/checkout",
  "/list",
  "/order-success",
  "/account/orders",
  "/account/history",
  "/pantry",
  "/admin/pantry",
  "/admin/products",
  "/admin/inventory",
  "/admin/vendors",
  "/admin/purchase-orders",
  "/admin/credit-notes",
  "/admin/picker",
  "/admin/orders",
  "/admin/reports/sales",
  "/admin/reports/inventory",
  "/admin/reports/vendors",
] as const;

/** Routes that belong only on FoodVault. Matched exactly or as a path prefix. */
export const FOODVAULT_GUARDED_PREFIXES = [
  "/vault-market",
  "/brands",
  "/partners",
  "/browse-brands",
  "/explore",
  "/search",
  "/pricing",
  "/how-it-works",
  "/for-brands",
  "/about",
  "/discover",
  "/membership",
  "/signup",
  "/partner",
  "/partner-application",
  "/partner-login",
  "/affiliate",
  "/affiliate-program",
  "/affiliate-terms",
  "/dashboard",
  "/favorites",
  "/go",
  "/admin/partner-applications",
  "/admin/partners",
  "/admin/partner-contacts",
  "/admin/members",
  "/admin/affiliates",
  "/admin/affiliate-analytics",
  "/admin/affiliate-transactions",
  "/admin/affiliate-system-health",
  "/admin/affiliate-fraud",
  "/admin/affiliate-leaderboards",
  "/admin/discover",
  "/admin/homepage",
] as const;

/** Exact paths only, so `/admin/reports/sales` is not treated as a brand report. */
export const FOODVAULT_EXACT_ROUTES = ["/admin/reports"] as const;
