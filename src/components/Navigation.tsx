"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MobileMenu } from "@/components/NavLinks";
import { NavLinks } from "@/components/NavLinks";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import {
  useIsFreeTrialMember,
  useTrialEndsAt,
} from "@/components/member/MemberSignupCtaProvider";
import {
  getAuthSession,
  isSupabaseConfigured,
  LOGIN_PATH,
  signOut,
} from "@/lib/auth";
import {
  affiliateNavMenuItems,
  memberNavMenuItems,
  partnerNavMenuItems,
  type NavAuthState,
} from "@/lib/nav-auth";
import { FavoritesNavLink } from "@/components/favorites/FavoritesNavLink";
import { isPartnerAccount } from "@/lib/partner-data";
import { isAffiliateAccount } from "@/lib/affiliate/auth";
import { isAdminAccount } from "@/lib/member/client-auth";
import { createClient } from "@/lib/supabase/client";
import { FoodVaultLogo } from "@/components/FoodVaultLogo";
import { NavSearch } from "@/components/NavSearch";
import { NzAnnouncementBar } from "@/components/NzAnnouncementBar";
import {
  FREE_TRIAL_COUNTDOWN_BAR_HEIGHT_REM,
  FreeTrialCountdownBar,
} from "@/components/member/FreeTrialCountdownBar";
import { getTrialCountdownParts } from "@/lib/member/trial-countdown";

export type { NavAuthState } from "@/lib/nav-auth";

function useNavAuth(): NavAuthState {
  const [auth, setAuth] = useState<NavAuthState>({ status: "loading" });

  const resolveAuth = useCallback(async () => {
    const session = await getAuthSession();

    if (!session) {
      setAuth({ status: "guest" });
      return;
    }

    const [partner, affiliate, admin] = await Promise.all([
      isPartnerAccount(session.id),
      isAffiliateAccount(session.id),
      isAdminAccount(session.id),
    ]);

    if (admin) {
      setAuth({ status: "admin", email: session.email });
      return;
    }

    if (partner || session.accountType === "partner") {
      setAuth({ status: "partner", email: session.email });
      return;
    }

    if (affiliate || session.accountType === "affiliate") {
      setAuth({ status: "affiliate", email: session.email });
      return;
    }

    setAuth({ status: "member", email: session.email });
  }, []);

  useEffect(() => {
    void resolveAuth();

    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void resolveAuth();
    });

    return () => subscription.unsubscribe();
  }, [resolveAuth]);

  return auth;
}

function AccountMenuButton({ open }: { open: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-foreground transition-colors hover:bg-surface-lavender">
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.25" />
        <path strokeLinecap="round" d="M6 19.5c0-3 2.686-4.5 6-4.5s6 1.5 6 4.5" />
      </svg>
      <svg
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );
}

function AccountDropdown({
  auth,
}: {
  auth: Extract<NavAuthState, { status: "member" | "partner" | "affiliate" | "admin" }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const items =
    auth.status === "partner"
      ? partnerNavMenuItems
      : auth.status === "affiliate"
        ? affiliateNavMenuItems
      : auth.status === "admin"
        ? [{ href: "/admin/dashboard", label: "Admin Dashboard" }]
        : memberNavMenuItems;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <AccountMenuButton open={open} />
      </button>

      {open ? (
        <div
          role="menu"
          className="fv-dropdown absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-card"
        >
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DesktopAuthActions({ auth }: { auth: NavAuthState }) {
  const isFreeTrial = useIsFreeTrialMember();

  if (auth.status === "loading") {
    return <div className="hidden h-9 w-20 animate-pulse rounded-full bg-surface xl:block" />;
  }

  if (auth.status === "guest") {
    return (
      <>
        <Link
          href={LOGIN_PATH}
          className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary lg:inline-block"
        >
          Login
        </Link>
        <MemberSignupCtaLink
          variant="start-free-trial-nav"
          className="fv-btn-primary inline-flex shrink-0 items-center justify-center rounded-sm px-3 py-2 text-xs font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:px-4 sm:text-sm md:px-5"
        >
          <span className="hidden sm:inline">Start FREE Trial</span>
          <span className="sm:hidden">Free Trial</span>
        </MemberSignupCtaLink>
      </>
    );
  }

  return (
    <div className="hidden items-center gap-3 xl:flex">
      {auth.status === "member" && isFreeTrial ? (
        <MemberSignupCtaLink
          variant="start-free-trial"
          className="fv-btn-primary inline-flex shrink-0 items-center justify-center rounded-sm px-3 py-2 text-xs font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:px-4 sm:text-sm md:px-5"
        />
      ) : null}
      {auth.status === "member" ? <FavoritesNavLink /> : null}
      <AccountDropdown auth={auth} />
    </div>
  );
}

export function Navigation() {
  const auth = useNavAuth();
  const isFreeTrial = useIsFreeTrialMember();
  const trialEndsAt = useTrialEndsAt();
  const showCountdownBar =
    auth.status === "member" &&
    isFreeTrial &&
    Boolean(trialEndsAt) &&
    !getTrialCountdownParts(trialEndsAt).expired;
  const mobileMenuTop = showCountdownBar
    ? `calc(4.25rem + 1.5rem + ${FREE_TRIAL_COUNTDOWN_BAR_HEIGHT_REM}rem)`
    : undefined;

  return (
    <header className="sticky top-0 z-50 bg-white">
      <NzAnnouncementBar />
      <nav
        className="mx-auto flex h-[4.25rem] max-w-[1200px] items-center justify-between gap-4 border-b border-border px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80"
          aria-label="FoodVault home"
        >
          <FoodVaultLogo size="nav" priority />
        </Link>

        <div className="hidden min-w-0 flex-[1.35] items-center gap-5 xl:flex xl:gap-6">
          <NavSearch isPartner={auth.status === "partner"} />
          <NavLinks isPartner={auth.status === "partner"} />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <DesktopAuthActions auth={auth} />
          <MobileMenu auth={auth} menuTop={mobileMenuTop} />
        </div>
      </nav>
      <FreeTrialCountdownBar />
    </header>
  );
}
