export const AFFILIATE_PROGRAM_PATH = "/affiliate-program";
export const AFFILIATE_REGISTER_PATH = "/affiliate/register";
export const AFFILIATE_LOGIN_PATH = "/affiliate/login";
export const AFFILIATE_DASHBOARD_PATH = "/affiliate/dashboard";

export type AffiliateDashboardTab = "dashboard" | "brands" | "settings";

export const AFFILIATE_DASHBOARD_TABS: {
  id: AffiliateDashboardTab;
  label: string;
}[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "brands", label: "My Brands" },
  { id: "settings", label: "Account Settings" },
];
