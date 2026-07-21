"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavAuthState } from "@/lib/nav-auth";
import {
  affiliateNavMenuItems,
  memberNavMenuItems,
  partnerNavMenuItems,
} from "@/lib/nav-auth";
import { FavoritesNavLink } from "@/components/favorites/FavoritesNavLink";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import {
  useIsActiveMember,
  useIsFreeTrialMember,
} from "@/components/member/MemberSignupCtaProvider";
import { LOGIN_PATH, signOut } from "@/lib/auth";
import { FREE_TRIAL_COUNTDOWN_BAR_HEIGHT_REM } from "@/components/member/FreeTrialCountdownBar";
import {
  NAV_MENU_CTA_BLOCK_CLASS,
  NAV_MENU_CTA_CLASS,
  NAV_MENU_PREVIEW_GRADIENT,
} from "@/lib/nav-menu-preview";

const navLinks = [
  { href: "/browse-brands", label: "Discover" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-brands", label: "For Brands" },
  { href: "/pricing", label: "Pricing" },
];

// Active Members and Partners get a dashboard-style header: marketing/conversion
// pages (aimed at converting visitors) are hidden.
const PORTAL_HIDDEN_HREFS = new Set([
  "/how-it-works",
  "/for-brands",
  "/pricing",
]);

const PARTNER_HIDDEN_HREFS = new Set([...PORTAL_HIDDEN_HREFS, "/browse-brands"]);

const ACTIVE_MEMBER_HIDDEN_HREFS = new Set([...PORTAL_HIDDEN_HREFS, "/browse-brands"]);

const FREE_TRIAL_HIDDEN_HREFS = new Set(["/browse-brands", "/for-brands"]);

export function NavLinks({
  mobile = false,
  isPartner = false,
  menuPreview = false,
}: {
  mobile?: boolean;
  isPartner?: boolean;
  menuPreview?: boolean;
}) {
  const pathname = usePathname();
  const isActiveMember = useIsActiveMember();
  const isFreeTrial = useIsFreeTrialMember();

  const hiddenHrefs = isPartner
    ? PARTNER_HIDDEN_HREFS
    : isFreeTrial
      ? FREE_TRIAL_HIDDEN_HREFS
      : isActiveMember
        ? ACTIVE_MEMBER_HIDDEN_HREFS
        : null;
  const visibleLinks = hiddenHrefs
    ? navLinks.filter((link) => !hiddenHrefs.has(link.href))
    : navLinks;

  return (
    <>
      {visibleLinks.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              mobile
                ? `block rounded-lg px-3 py-2.5 text-base transition-colors duration-150 ${
                    isActive
                      ? menuPreview
                        ? "bg-white/10 font-semibold text-white"
                        : "bg-primary/10 font-semibold text-primary"
                      : menuPreview
                        ? "font-medium text-white/90 hover:bg-white/10 hover:text-white"
                        : "font-medium text-foreground hover:bg-primary/5 hover:text-primary"
                  }`
                : `text-sm transition-colors duration-150 ${
                    isActive
                      ? menuPreview
                        ? "border-b-2 border-white pb-0.5 font-semibold text-white"
                        : "border-b-2 border-primary pb-0.5 font-semibold text-primary"
                      : menuPreview
                        ? "font-medium text-white/90 hover:text-white"
                        : "font-medium text-muted-foreground hover:text-primary"
                  }`
            }
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

function MobileAuthSection({
  auth,
  onNavigate,
  menuPreview = false,
}: {
  auth: NavAuthState;
  onNavigate: () => void;
  menuPreview?: boolean;
}) {
  const router = useRouter();
  const isFreeTrial = useIsFreeTrialMember();

  if (auth.status === "loading") {
    return (
      <div
        className={`mt-4 border-t pt-4 ${menuPreview ? "border-white/15" : "border-border"}`}
      >
        <div
          className={`h-10 animate-pulse rounded-lg ${
            menuPreview ? "bg-white/20" : "bg-surface"
          }`}
        />
      </div>
    );
  }

  if (auth.status === "guest" || auth.status === "admin") {
    return (
      <div
        className={`mt-4 space-y-3 border-t pt-4 ${
          menuPreview ? "border-white/15" : "border-border"
        }`}
      >
        {auth.status === "admin" ? (
          <Link
            href="/admin/dashboard"
            onClick={onNavigate}
            className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
              menuPreview
                ? "text-white hover:bg-white/10 hover:text-white"
                : "text-foreground hover:bg-primary/5 hover:text-primary"
            }`}
          >
            Admin Dashboard
          </Link>
        ) : (
          <Link
            href={LOGIN_PATH}
            onClick={onNavigate}
            className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
              menuPreview
                ? "text-white hover:bg-white/10 hover:text-white"
                : "text-foreground hover:bg-primary/5 hover:text-primary"
            }`}
          >
            Login
          </Link>
        )}
        <MemberSignupCtaLink
          variant="start-free-trial-nav"
          onClick={onNavigate}
          className={
            menuPreview
              ? NAV_MENU_CTA_BLOCK_CLASS
              : "fv-btn-primary block rounded-sm px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
          }
        >
          Start FREE Trial
        </MemberSignupCtaLink>
        {auth.status === "admin" ? (
          <button
            type="button"
            onClick={() => {
              onNavigate();
              void signOut().then(() => {
                router.push("/");
                router.refresh();
              });
            }}
            className={`block w-full rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors ${
              menuPreview
                ? "text-white hover:bg-white/10 hover:text-white"
                : "text-foreground hover:bg-primary/5 hover:text-primary"
            }`}
          >
            Logout
          </button>
        ) : null}
      </div>
    );
  }

  const items =
    auth.status === "partner"
      ? partnerNavMenuItems
      : auth.status === "affiliate"
        ? affiliateNavMenuItems
        : memberNavMenuItems;

  async function handleLogout() {
    onNavigate();
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div
      className={`mt-4 space-y-1 border-t pt-4 ${
        menuPreview ? "border-white/15" : "border-border"
      }`}
    >
      {auth.status === "member" && isFreeTrial ? (
        <MemberSignupCtaLink
          variant="start-free-trial"
          onClick={onNavigate}
          className={
            menuPreview
              ? `${NAV_MENU_CTA_BLOCK_CLASS} mb-3`
              : "fv-btn-primary mb-3 block rounded-sm px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
          }
        />
      ) : null}
      {auth.status === "member" ? (
        <FavoritesNavLink
          className="block rounded-lg px-3 py-2.5"
          onNavigate={onNavigate}
          menuPreview={menuPreview}
        />
      ) : null}
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
            menuPreview
              ? "text-white/90 hover:bg-white/10 hover:text-white"
              : "text-foreground hover:bg-primary/5 hover:text-primary"
          }`}
        >
          {item.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => void handleLogout()}
        className={`block w-full rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors ${
          menuPreview
            ? "text-white/90 hover:bg-white/10 hover:text-white"
            : "text-foreground hover:bg-primary/5 hover:text-primary"
        }`}
      >
        Logout
      </button>
    </div>
  );
}

export function MobileMenu({
  auth,
  menuTop,
  menuPreview = false,
}: {
  auth: NavAuthState;
  menuTop?: string;
  menuPreview?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const overlayTop =
    menuTop ?? (menuPreview ? "4.25rem" : "calc(4.25rem + 1.5rem)");
  const panelTop =
    menuTop ?? (menuPreview ? "4.25rem" : "calc(4.25rem + 1.5rem)");
  const panelMaxHeight = menuTop
    ? `calc(100vh - 4.25rem - 1.5rem - ${FREE_TRIAL_COUNTDOWN_BAR_HEIGHT_REM}rem)`
    : menuPreview
      ? "calc(100vh - 4.25rem)"
      : "calc(100vh - 4.25rem - 1.5rem)";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${
          menuPreview
            ? "border-white text-white hover:bg-white/10"
            : "border-border text-foreground hover:bg-primary/5 hover:text-primary"
        }`}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
            style={{ top: overlayTop }}
            onClick={closeMenu}
            aria-label="Close menu overlay"
          />
          <div
            id="mobile-nav"
            className={`fixed inset-x-0 z-50 overflow-y-auto border-b px-4 py-5 shadow-card sm:px-6 md:max-h-[calc(100vh-4.25rem-1.75rem)] ${
              menuPreview
                ? `border-white/15 ${NAV_MENU_PREVIEW_GRADIENT}`
                : "border-border bg-white"
            }`}
            style={{ top: panelTop, maxHeight: panelMaxHeight }}
          >
            <nav className="space-y-1" aria-label="Mobile navigation">
              <NavLinks mobile isPartner={auth.status === "partner"} menuPreview={menuPreview} />
            </nav>
            <MobileAuthSection auth={auth} onNavigate={closeMenu} menuPreview={menuPreview} />
          </div>
        </>
      )}
    </div>
  );
}
