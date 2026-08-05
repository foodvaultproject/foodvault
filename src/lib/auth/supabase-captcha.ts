/** Options passed to Supabase Auth when project CAPTCHA protection is enabled. */
export function supabaseAuthCaptchaOptions(captchaToken?: string | null) {
  const trimmed = captchaToken?.trim();
  if (!trimmed) {
    return {};
  }

  return { captchaToken: trimmed };
}
