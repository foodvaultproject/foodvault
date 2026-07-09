"use client";

import { AFFILIATE_DASHBOARD_TABS, type AffiliateDashboardTab } from "@/lib/affiliate/paths";
import { signOut } from "@/lib/auth";
import { AffiliateNotificationBell } from "@/components/notification-service/AffiliateNotificationBell";

type AffiliatePortalShellProps = {
  children: React.ReactNode;
  activeTab: AffiliateDashboardTab;
  onTabChange: (tab: AffiliateDashboardTab) => void;
};

export function AffiliatePortalShell({
  children,
  activeTab,
  onTabChange,
}: AffiliatePortalShellProps) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] bg-surface">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-lg font-bold">Affiliate Vault</p>
          <p className="mt-1 text-xs text-white/60">Affiliate Dashboard</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {AFFILIATE_DASHBOARD_TABS.map((item) => {
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <button
            type="button"
            onClick={() => void signOut().then(() => {
              window.location.href = "/";
            })}
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-end border-b border-border bg-background px-4 py-3 lg:px-8">
          <AffiliateNotificationBell />
        </div>
        <div className="border-b border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {AFFILIATE_DASHBOARD_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function parseAffiliateDashboardTab(
  value: string | null | undefined
): AffiliateDashboardTab {
  if (value === "brands" || value === "settings") {
    return value;
  }
  return "dashboard";
}

export function affiliateDashboardTabFromSearchParams(
  searchParams: URLSearchParams
): AffiliateDashboardTab {
  return parseAffiliateDashboardTab(searchParams.get("tab"));
}
