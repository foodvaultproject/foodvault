import type { ReactNode } from "react";

export const faqAccordionButtonClassName =
  "group flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors duration-200 hover:bg-surface-lavender/70 sm:px-6 sm:py-5";

export const faqAccordionButtonClassNameCompact =
  "group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-surface-lavender/70";

export function FAQAccordionToggleIcon({
  isOpen,
  size = "md",
}: {
  isOpen: boolean;
  size?: "sm" | "md";
}) {
  const boxClass = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const iconClass = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={`flex ${boxClass} shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20 group-hover:text-primary-hover ${isOpen ? "bg-primary/15 text-primary-hover" : ""}`}
      aria-hidden="true"
    >
      <svg
        className={iconClass}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        )}
      </svg>
    </span>
  );
}

export function FAQAccordionQuestion({
  children,
  isOpen,
  className = "",
}: {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
}) {
  return (
    <span
      className={`min-w-0 flex-1 font-semibold text-foreground transition-colors duration-200 group-hover:text-primary ${isOpen ? "text-primary" : ""} ${className}`}
    >
      {children}
    </span>
  );
}
