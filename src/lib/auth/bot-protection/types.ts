export type AuthRateLimitAction =
  | "login"
  | "signup"
  | "password_reset"
  | "email_verification";

export type AuthEmailKind = "signup_verification" | "password_reset";

export const AUTH_RATE_LIMIT_MESSAGE =
  "Too many requests from your network. Please wait a few minutes and try again.";

export const AUTH_CAPTCHA_FAILED_MESSAGE =
  "CAPTCHA verification failed. Please try again.";

export const AUTH_CAPTCHA_REQUIRED_MESSAGE =
  "Please complete the CAPTCHA check before continuing.";
