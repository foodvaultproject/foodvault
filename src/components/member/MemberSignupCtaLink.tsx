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
  ...props
}: MemberSignupCtaLinkProps) {
  const { isFreeTrial } = useMemberSignupCtaContext();
  const { label, href } = resolveMemberSignupCta(variant, isFreeTrial);

  return (
    <Link href={href} {...props}>
      {isFreeTrial ? label : (children ?? label)}
    </Link>
  );
}
