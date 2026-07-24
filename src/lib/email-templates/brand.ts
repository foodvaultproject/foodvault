import { DEFAULT_SUPPORT_EMAIL } from "@/lib/system-settings";

/** FoodVault brand tokens aligned with src/app/globals.css */
export const EMAIL_BRAND = {
  primary: "#8b7cf6",
  primaryHover: "#7a69f2",
  primaryPressed: "#6f5ce8",
  primaryAccent: "#6f5ce8",
  primaryForeground: "#ffffff",
  primaryGradient: "linear-gradient(135deg, #8b7cf6 0%, #6f5ce8 100%)",
  background: "#ffffff",
  pageBackground: "#f5f2ff",
  foreground: "#111827",
  body: "#374151",
  muted: "#6b7280",
  mutedLight: "#9ca3af",
  border: "#e7e2ff",
  surface: "#f5f2ff",
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
