"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LOGIN_PATH, PARTNER_LOGIN_PATH, resetPassword } from "@/lib/auth";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const isPartner = searchParams.get("account") === "partner";
  const backLink = isPartner ? PARTNER_LOGIN_PATH : LOGIN_PATH;
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const result = await resetPassword(email.trim(), backLink);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setMessage("If an account exists for that email, a reset link has been sent.");
    setSubmitting(false);
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isPartner ? "name@business.co.nz" : "you@example.com"}
                className={`mt-2 ${inputClass}`}
              />
            </div>

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
              className="inline-fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
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

export function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-surface-lavender" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
