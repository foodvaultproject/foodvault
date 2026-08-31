"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LOGIN_PATH, PARTNER_LOGIN_PATH } from "@/lib/auth";

export type LoginMode = "member" | "business";

const tabs: { id: LoginMode; label: string; path: string }[] = [
  { id: "member", label: "Member Login", path: LOGIN_PATH },
  { id: "business", label: "Business Login", path: PARTNER_LOGIN_PATH },
];

export function LoginModeTabs({ active }: { active: LoginMode }) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";

  return (
    <div
      role="tablist"
      aria-label="Choose login type"
      className="grid grid-cols-2 rounded-md bg-surface p-1 ring-1 ring-border"
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={`${tab.path}${query}`}
            role="tab"
            aria-selected={selected}
            className={`rounded-sm px-3 py-2.5 text-center text-sm font-semibold transition-colors sm:text-base ${
              selected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
