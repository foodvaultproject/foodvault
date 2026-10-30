"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminWorkspace } from "@/lib/admin/workspace-paths";

const tabs = [
  { href: "/admin/reports", label: "Brand reports", exact: true, workspace: "foodvault" as const },
  { href: "/admin/reports/sales", label: "Sales", workspace: "stockup" as const },
  { href: "/admin/reports/inventory", label: "Inventory", workspace: "stockup" as const },
  { href: "/admin/reports/vendors", label: "Vendors", workspace: "stockup" as const },
];

export function ReportsSuiteNav({ workspace }: { workspace: AdminWorkspace }) {
  const pathname = usePathname();
  const visibleTabs = tabs.filter((tab) => tab.workspace === workspace);

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
