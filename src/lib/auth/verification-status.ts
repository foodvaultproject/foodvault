"use server";

import type { AccountType } from "@/lib/auth";
import { getAccountTypeFromMetadata } from "@/lib/auth";
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

async function findUserByEmail(email: string) {
  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  let page = 1;
  const perPage = 1000;
  const normalized = email.trim().toLowerCase();

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === normalized
    );
    if (user) {
      return user;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

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

  const user = await findUserByEmail(trimmed);
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
