"use server";

import type { AccountType } from "@/lib/auth";
import { getAccountTypeFromMetadata } from "@/lib/auth";
import { findAuthUserByEmail } from "@/lib/auth/find-user-by-email";
import { createAdminClient } from "@/lib/supabase/admin";

export type VerificationStatusResult =
  | {
      found: false;
    }
  | {
      found: true;
      verified: boolean;
      signupCompleted: boolean;
      accountType: AccountType;
    };

export async function getVerificationStatusAction(
  email: string,
  expectedAccount: AccountType
): Promise<VerificationStatusResult> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { found: false };
  }

  if (!createAdminClient()) {
    return { found: false };
  }

  const user = await findAuthUserByEmail(trimmed);
  if (!user) {
    return { found: false };
  }

  const accountType = getAccountTypeFromMetadata(user.user_metadata);
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const signupCompletedAt =
    typeof metadata.signup_completed_at === "string"
      ? metadata.signup_completed_at.trim()
      : "";

  return {
    found: true,
    verified: Boolean(user.email_confirmed_at),
    signupCompleted: Boolean(signupCompletedAt),
    accountType:
      accountType === expectedAccount ? accountType : expectedAccount,
  };
}
