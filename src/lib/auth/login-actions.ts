"use server";

import { authGuardFailure, enforceAuthBotProtection } from "@/lib/auth/bot-protection/enforce";

export async function assertLoginAllowedAction() {
  const guard = await enforceAuthBotProtection({
    action: "login",
    requireTurnstile: false,
  });

  if (!guard.ok) {
    return authGuardFailure(guard);
  }

  return { ok: true as const };
}
