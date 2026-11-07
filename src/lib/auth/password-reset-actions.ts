"use server";

import { headers } from "next/headers";
import type { AccountType } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/auth";
import { authGuardFailure, enforceAuthBotProtection } from "@/lib/auth/bot-protection/enforce";
import { issueAndSendPasswordReset } from "@/lib/auth/email-verification";
import { getAppMode, STOCKUP_ORIGIN } from "@/lib/app-mode";
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
    return authGuardFailure(guard);
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

  const headerStore = await headers();
  const stockup =
    getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) ===
    "stockup";

  const sendResult = await issueAndSendPasswordReset({
    email: trimmed,
    account: options.account ?? "member",
    siteOrigin: stockup ? STOCKUP_ORIGIN : undefined,
    brand: stockup ? "stockup" : "foodvault",
  });

  if ("error" in sendResult && sendResult.error) {
    return { error: sendResult.error };
  }

  return { success: true as const };
}
