"use server";

import {
  ensureAuthenticatedSession,
  isSignupSetupComplete,
  repairMemberSessionIfNeeded,
} from "@/lib/auth/session-completion";
import { getAccountTypeFromMetadata } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function needsSignupSetupAction(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    return false;
  }

  const accountType = getAccountTypeFromMetadata(user.user_metadata);
  return !(await isSignupSetupComplete(supabase, user, accountType));
}

export async function repairMemberSessionAction(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    return false;
  }

  await repairMemberSessionIfNeeded(supabase, user);
  return !(await needsSignupSetupAction());
}

export async function finalizeVerifiedSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    return { ready: false as const };
  }

  const accountType = getAccountTypeFromMetadata(user.user_metadata);
  const completion = await ensureAuthenticatedSession(supabase, user, {
    expectedAccountType: accountType,
  });

  return {
    ready: true as const,
    redirectPath: completion.redirectPath,
    error: completion.error ?? null,
  };
}
