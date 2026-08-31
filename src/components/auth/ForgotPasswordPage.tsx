"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  TurnstileField,
  type TurnstileFieldHandle,
  isTurnstileEnabledClient,
} from "@/components/auth/TurnstileField";
import { LOGIN_PATH, PARTNER_LOGIN_PATH } from "@/lib/auth";
import { resetPassword } from "@/lib/auth/password-reset-actions";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const RESET_LINK_INVALID_MESSAGE =
  "That password reset link is invalid or has expired. Enter your email to send a new one.";

type ForgotPasswordPageProps = {
  initialEmail?: string;
  isPartner?: boolean;
  initialError?: string | null;
};

export function ForgotPasswordPage({
  initialEmail = "",
  isPartner = false,
  initialError = null,
}: ForgotPasswordPageProps) {
  const backLink = isPartner ? PARTNER_LOGIN_PATH : LOGIN_PATH;
  const [email, setEmail] = useState(initialEmail);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    initialError === "reset_link_invalid" ? RESET_LINK_INVALID_MESSAGE : null
  );
  const [submitting, setSubmitting] = useState(false);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const captchaRequired = isTurnstileEnabledClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (captchaRequired && !turnstileToken) {
      setError("Please complete the CAPTCHA check before continuing.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await resetPassword(email.trim(), {
        account: isPartner ? "partner" : "member",
        turnstileToken,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage("If an account exists for that email, a reset link has been sent.");
    } finally {
      setSubmitting(false);
      turnstileRef.current?.reset();
    }
  };

  return (
    <section className="bg-surface-lavender py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-bold text-foreground">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isPartner ? "name@business.co.nz" : "you@example.com"}
                className={`mt-2 ${inputClass}`}
              />
            </div>

            <TurnstileField ref={turnstileRef} onTokenChange={setTurnstileToken} />

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg border border-success/20 bg-success-light px-4 py-3 text-sm text-foreground">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send password reset email"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href={backLink} className="font-semibold text-primary hover:text-primary-hover">
              Back to Log In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
