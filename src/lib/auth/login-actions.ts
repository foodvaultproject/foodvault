"use server";

import { enforceAuthBotProtection } from "@/lib/auth/bot-protection/enforce";

export async function assertLoginAllowedAction() {
  const guard = await enforceAuthBotProtection({
    action: "login",
    requireTurnstile: false,
  });

  if (!guard.ok) {
    return { error: guard.error };
  }

  return { ok: true as const };
}
