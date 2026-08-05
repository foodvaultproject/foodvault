import { getRequestClientIp } from "@/lib/auth/bot-protection/client-ip";
import { checkAuthRateLimit } from "@/lib/auth/bot-protection/rate-limit";
import {
  isTurnstileConfigured,
  verifyTurnstileToken,
} from "@/lib/auth/bot-protection/turnstile";
import type { AuthRateLimitAction } from "@/lib/auth/bot-protection/types";

type EnforceAuthBotProtectionInput = {
  action: AuthRateLimitAction;
  turnstileToken?: string | null;
  requireTurnstile?: boolean;
};

export async function enforceAuthBotProtection(
  input: EnforceAuthBotProtectionInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await getRequestClientIp();
  const rateLimit = await checkAuthRateLimit(input.action, ip);
  if (!rateLimit.allowed) {
    return { ok: false, error: rateLimit.error };
  }

  const shouldVerifyCaptcha =
    input.requireTurnstile !== false && isTurnstileConfigured();
  if (!shouldVerifyCaptcha) {
    return { ok: true };
  }

  const captcha = await verifyTurnstileToken(input.turnstileToken);
  if (!captcha.ok) {
    return { ok: false, error: captcha.error };
  }

  return { ok: true };
}
