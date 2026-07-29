"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { HOME_BROWSE_ANCHOR } from "@/components/home/HomePartnerBrowseBrands";

function scrollToHomeBrowseSection() {
  document.getElementById(HOME_BROWSE_ANCHOR)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

type HomeTrendingDepartmentCardLinkProps = {
  href: string;
  keepBrowseOnHomepage: boolean;
  className: string;
  children: ReactNode;
};

export function HomeTrendingDepartmentCardLink({
  href,
  keepBrowseOnHomepage,
  className,
  children,
}: HomeTrendingDepartmentCardLinkProps) {
  const router = useRouter();

  if (!keepBrowseOnHomepage) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        scrollToHomeBrowseSection();
        router.push(href, { scroll: false });
      }}
    >
      {children}
    </Link>
  );
}
