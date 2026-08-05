"use server";

import type { AccountType } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/auth";
import { enforceAuthBotProtection } from "@/lib/auth/bot-protection/enforce";
import { issueAndSendPasswordReset } from "@/lib/auth/email-verification";
import { createAdminClient } from "@/lib/supabase/admin";

type ResetPasswordOptions = {
  account?: AccountType;
  turnstileToken?: string | null;
  /** Logged-in account settings can skip CAPTCHA but stay rate limited. */
  skipTurnstile?: boolean;
};

export async function resetPassword(
  email: string,
  options: ResetPasswordOptions = {}
) {
  const trimmed = email.trim();

  if (!trimmed) {
    return { error: "Enter your email address first." };
  }

  const guard = await enforceAuthBotProtection({
    action: "password_reset",
    turnstileToken: options.turnstileToken,
    requireTurnstile: options.skipTurnstile ? false : undefined,
  });
  if (!guard.ok) {
    return { error: guard.error };
  }

  if (!isSupabaseConfigured()) {
    return {
      error:
        "Password reset is not configured yet. Contact support@foodvault.co.nz for help.",
    };
  }

  if (!createAdminClient()) {
    return { error: "Password reset is not configured in this environment." };
  }

  const sendResult = await issueAndSendPasswordReset({
    email: trimmed,
    account: options.account ?? "member",
  });

  if ("error" in sendResult && sendResult.error) {
    return { error: sendResult.error };
  }

  return { success: true as const };
}
