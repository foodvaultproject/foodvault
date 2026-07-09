import {
  MEMBER_ACCOUNT_PATH,
  MEMBER_DASHBOARD_PATH,
  MEMBER_FAVORITES_PATH,
  MEMBER_MEMBERSHIP_PATH,
} from "@/lib/member/paths";

export type NavAuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "member"; email: string }
  | { status: "partner"; email: string }
  | { status: "affiliate"; email: string }
  | { status: "admin"; email: string };

export const affiliateNavMenuItems = [
  { href: "/affiliate/dashboard", label: "Affiliate Dashboard" },
  { href: "/affiliate/dashboard?tab=brands", label: "My Brands" },
  { href: "/affiliate/dashboard?tab=settings", label: "Account Settings" },
] as const;

export const partnerNavMenuItems = [
  { href: "/partner/listing", label: "My Listing" },
  { href: "/partner/affiliate-program", label: "Affiliate Program" },
  { href: "/partner/account", label: "My Account" },
  { href: "/partner/support", label: "Support" },
] as const;

export const memberNavMenuItems = [
  { href: MEMBER_DASHBOARD_PATH, label: "My Dashboard" },
  { href: MEMBER_ACCOUNT_PATH, label: "My Account" },
  { href: MEMBER_MEMBERSHIP_PATH, label: "Membership" },
  { href: MEMBER_FAVORITES_PATH, label: "Favorites" },
  { href: "/contact", label: "Help & Support" },
] as const;

export { MEMBER_FAVORITES_PATH };
