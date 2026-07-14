"use server";

import { completeSignupVerification } from "@/lib/auth/complete-verification";
import { createClient } from "@/lib/supabase/server";

export async function finalizeVerifiedSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    return { ready: false as const };
  }

  const completion = await completeSignupVerification(supabase, user);
  return {
    ready: true as const,
    redirectPath: completion.redirectPath,
    error: completion.error ?? null,
  };
}
