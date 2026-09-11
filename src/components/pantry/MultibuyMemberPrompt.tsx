import Link from "next/link";
import { LOGIN_PATH } from "@/lib/auth";

export function MultibuyMemberPrompt({
  nextPath,
  className = "",
}: {
  nextPath: string;
  className?: string;
}) {
  return (
    <Link
      href={`${LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`}
      className={`text-[11px] font-semibold text-vm-primary underline-offset-2 hover:underline ${className}`.trim()}
    >
      Sign in to unlock Multi-Buy deals
    </Link>
  );
}
