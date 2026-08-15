"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { useMemberSignupCtaContext } from "@/components/member/MemberSignupCtaProvider";
import {
  resolveMemberSignupCta,
  type MemberSignupCtaVariant,
} from "@/lib/member/signup-cta";

type MemberSignupCtaLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  variant: MemberSignupCtaVariant;
  children?: ReactNode;
};

export function MemberSignupCtaLink({
  variant,
  children,
  className,
  ...props
}: MemberSignupCtaLinkProps) {
  const { isFreeTrial, isLoading } = useMemberSignupCtaContext();
  const { label, href } = resolveMemberSignupCta(variant, isFreeTrial);

  if (isLoading) {
    return (
      <span
        className={`inline-block animate-pulse rounded-sm bg-white/25 ${className ?? ""}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <Link href={href} className={className} prefetch {...props}>
      {isFreeTrial ? label : (children ?? label)}
    </Link>
  );
}
