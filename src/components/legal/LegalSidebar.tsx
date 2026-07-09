"use client";

import { useEffect, useState } from "react";

export type LegalNavItem = {
  id: string;
  label: string;
};

type LegalSidebarProps = {
  title: string;
  subtitle?: string;
  items: LegalNavItem[];
};

export function LegalSidebar({ title, subtitle, items }: LegalSidebarProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label={`${title} navigation`}
      className="rounded-lg border border-border bg-background p-4 shadow-sm sm:p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
    >
      {subtitle && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {subtitle}
        </p>
      )}
      <p className={`text-xs font-bold uppercase tracking-widest text-muted-foreground ${subtitle ? "mt-1" : ""}`}>
        {title}
      </p>
      <ul className="mt-4 space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setActiveId(item.id)}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
