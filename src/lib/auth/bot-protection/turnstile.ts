import {
  AUTH_CAPTCHA_FAILED_MESSAGE,
  AUTH_CAPTCHA_REQUIRED_MESSAGE,
} from "@/lib/auth/bot-protection/types";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export function isTurnstileConfigured() {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );
}

export async function verifyTurnstileToken(
  token: string | null | undefined
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: true };
  }

  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, error: AUTH_CAPTCHA_REQUIRED_MESSAGE };
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: trimmed,
      }),
    }
  );

  if (!response.ok) {
    return { ok: false, error: AUTH_CAPTCHA_FAILED_MESSAGE };
  }

  const payload = (await response.json()) as TurnstileVerifyResponse;
  if (!payload.success) {
    return { ok: false, error: AUTH_CAPTCHA_FAILED_MESSAGE };
  }

  return { ok: true };
}
