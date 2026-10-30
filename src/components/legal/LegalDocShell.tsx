import { ReactNode } from "react";
import { LegalNavItem, LegalSidebar } from "./LegalSidebar";

type LegalDocShellProps = {
  badge?: string;
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  heroExtra?: ReactNode;
  sidebarTitle: string;
  sidebarSubtitle?: string;
  navItems: LegalNavItem[];
  children: ReactNode;
  footerNote?: ReactNode;
  stockup?: boolean;
};

export function LegalDocShell({
  badge,
  title,
  lastUpdated,
  intro,
  heroExtra,
  sidebarTitle,
  sidebarSubtitle,
  navItems,
  children,
  footerNote,
  stockup = false,
}: LegalDocShellProps) {
  return (
    <>
      <section
        className={
          stockup
            ? "bg-[#ecfdf5] pt-7 sm:pt-10 md:pt-12"
            : "bg-gradient-to-b from-surface-lavender via-background to-background pt-7 sm:pt-10 md:pt-12"
        }
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {badge && (
            <span
              className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                stockup ? "bg-vm-primary/10 text-vm-primary" : "bg-primary/10 text-primary"
              }`}
            >
              {badge}
            </span>
          )}
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Last Updated: {lastUpdated}
          </p>
          {intro && (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {intro}
            </p>
          )}
          {heroExtra && <div className="mt-6 max-w-4xl">{heroExtra}</div>}
        </div>
      </section>

      <section className="bg-background py-6 sm:py-7 md:py-10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 lg:px-8 xl:grid-cols-[260px_minmax(0,1fr)]">
          <LegalSidebar
            title={sidebarTitle}
            subtitle={sidebarSubtitle}
            items={navItems}
            stockup={stockup}
          />
          <div className="min-w-0 space-y-12 sm:space-y-16 [&_section]:scroll-mt-28">
            {children}
          </div>
        </div>
      </section>

      {footerNote && (
        <section className="border-t border-border bg-surface py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {footerNote}
          </div>
        </section>
      )}
    </>
  );
}

export function LegalSection({
  id,
  number,
  title,
  children,
  stockup = false,
}: {
  id: string;
  number?: string;
  title: string;
  children: ReactNode;
  stockup?: boolean;
}) {
  return (
    <section id={id}>
      <div className="flex items-baseline gap-3">
        {number && (
          <span
            className={`text-2xl font-bold sm:text-3xl ${
              stockup ? "text-vm-primary/40" : "text-primary/40"
            }`}
          >
            {number}
          </span>
        )}
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}
