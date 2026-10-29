import { getRequestClientIp } from "@/lib/auth/bot-protection/client-ip";
import { checkAuthRateLimit, rateLimitHeaders } from "@/lib/auth/bot-protection/rate-limit";
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

export type AuthGuardResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      retryAfterSeconds?: number;
      resetAt?: number;
      headers?: Record<string, string>;
    };

export function authGuardFailure(guard: Exclude<AuthGuardResult, { ok: true }>) {
  return {
    error: guard.error,
    ...(guard.resetAt
      ? {
          retryAfterSeconds: guard.retryAfterSeconds,
          resetAt: guard.resetAt,
          headers: guard.headers,
        }
      : {}),
  };
}

export async function enforceAuthBotProtection(
  input: EnforceAuthBotProtectionInput
): Promise<AuthGuardResult> {
  const ip = await getRequestClientIp();
  const rateLimit = await checkAuthRateLimit(input.action, ip);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      error: rateLimit.error,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      resetAt: rateLimit.resetAt,
      headers: rateLimitHeaders(rateLimit.resetAt, rateLimit.retryAfterSeconds),
    };
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
