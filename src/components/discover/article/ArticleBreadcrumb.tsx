import Link from "next/link";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";

export function ArticleBreadcrumb() {
  return (
    <Link
      href="/discover"
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Back to {DISCOVER_PAGE_TITLE}
    </Link>
  );
}
