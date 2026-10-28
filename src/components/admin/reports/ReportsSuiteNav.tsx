"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAppMode, routeOwner } from "@/lib/app-mode";

const tabs = [
  { href: "/admin/reports", label: "Brand reports", exact: true },
  { href: "/admin/reports/sales", label: "Sales" },
  { href: "/admin/reports/inventory", label: "Inventory" },
  { href: "/admin/reports/vendors", label: "Vendors" },
];

export function ReportsSuiteNav() {
  const pathname = usePathname();
  const mode = getAppMode();
  const visibleTabs = tabs.filter((tab) => {
    const owner = routeOwner(tab.href);
    return owner === "shared" || owner === mode;
  });

  return (
    <div className="flex flex-wrap gap-2 rounded border border-border bg-white p-1">
      {visibleTabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded px-3 py-2 text-sm font-semibold ${
              active ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
