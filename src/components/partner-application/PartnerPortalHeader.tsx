import Link from "next/link";
import { PARTNER_LOGIN_PATH } from "@/lib/auth";
import {
  PARTNER_APPLICATION_PATH,
  PARTNER_CREATE_ACCOUNT_PATH,
} from "@/lib/partner-auth";

const navLinks = [
  { href: PARTNER_APPLICATION_PATH, label: "Application" },
  { href: "/for-brands", label: "Requirements" },
  { href: "/contact", label: "Support" },
];

export function PartnerPortalHeader() {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={PARTNER_CREATE_ACCOUNT_PATH} className="text-lg font-bold text-primary">
          FoodVault <span className="font-semibold text-foreground">Partner</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href={PARTNER_LOGIN_PATH}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}

export function PartnerPortalFooter() {
  return (
    <div className="border-t border-border bg-surface py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FoodVault. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            Partner Support
          </Link>
        </div>
      </div>
    </div>
  );
}
