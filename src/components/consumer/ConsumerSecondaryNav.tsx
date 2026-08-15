"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, Search } from "lucide-react";
import {
  CONSUMER_EXPLORE_PATH,
  CONSUMER_HOME_PATH,
  CONSUMER_SEARCH_PATH,
  isConsumerHomePath,
  isExplorePath,
  isSearchPath,
} from "@/lib/consumer-nav-restructure";

const NAV_ITEMS = [
  {
    href: CONSUMER_HOME_PATH,
    label: "Home",
    shortLabel: "Home",
    Icon: Home,
    isActive: isConsumerHomePath,
  },
  {
    href: CONSUMER_SEARCH_PATH,
    label: "Search",
    shortLabel: "Search",
    Icon: Search,
    isActive: isSearchPath,
  },
  {
    href: CONSUMER_EXPLORE_PATH,
    label: "Explore & Save",
    shortLabel: "Explore",
    Icon: Images,
    isActive: isExplorePath,
  },
] as const;

function navItemClass(active: boolean, mobile: boolean): string {
  if (mobile) {
    return active
      ? "bg-primary font-bold text-white shadow-sm"
      : "font-bold text-white/85";
  }

  return active
    ? "bg-primary font-bold text-white shadow-sm"
    : "font-bold text-white/85 hover:bg-white/10 hover:text-white";
}

export function ConsumerSecondaryNav() {
  const pathname = usePathname();

  function handleNavClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (href !== CONSUMER_EXPLORE_PATH || pathname !== CONSUMER_EXPLORE_PATH) {
      return;
    }

    event.preventDefault();
    window.dispatchEvent(new Event("foodvault:explore-scroll-top"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <nav
        aria-label="Consumer sections"
        className="sticky top-[4.25rem] z-40 hidden border-b border-border/60 bg-white/85 backdrop-blur-md md:block"
      >
        <div className="mx-auto flex max-w-[1200px] justify-center px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/60 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            {NAV_ITEMS.map(({ href, label, Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch
                  onClick={(event) => handleNavClick(event, href)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-colors sm:px-4 sm:text-sm ${navItemClass(active, false)}`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.75} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] md:hidden"
      >
        <nav
          aria-label="Consumer sections"
          className="pointer-events-auto grid w-full max-w-md grid-cols-3 gap-1 rounded-full border border-white/15 bg-black/60 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          {NAV_ITEMS.map(({ href, shortLabel, Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <Link
                key={href}
                href={href}
                prefetch
                onClick={(event) => handleNavClick(event, href)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] transition-colors ${navItemClass(active, true)}`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2.75} />
                <span className="truncate">{shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
