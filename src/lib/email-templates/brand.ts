import { DEFAULT_SUPPORT_EMAIL } from "@/lib/system-settings";

/** FoodVault brand tokens aligned with src/app/globals.css */
export const EMAIL_BRAND = {
  primary: "#4f46e5",
  primaryHover: "#4338ca",
  primaryPressed: "#3730a3",
  primaryAccent: "#7c3aed",
  primaryForeground: "#ffffff",
  primaryGradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  background: "#ffffff",
  pageBackground: "#f8fafc",
  foreground: "#111827",
  body: "#374151",
  muted: "#6b7280",
  mutedLight: "#9ca3af",
  border: "#e5e7eb",
  surface: "#f8fafc",
  radiusButton: "8px",
  radiusCard: "12px",
  fontFamily:
    "Hanken Grotesk, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  supportEmail: DEFAULT_SUPPORT_EMAIL,
  websiteDisplay: "foodvault.co.nz",
} as const;

export function emailLogoUrl(appUrl: string) {
  return `${appUrl.replace(/\/$/, "")}/foodvault-logo.png`;
}

export function emailWebsiteUrl(appUrl: string) {
  const trimmed = appUrl.replace(/\/$/, "");
  return trimmed || "https://foodvault.co.nz";
}
