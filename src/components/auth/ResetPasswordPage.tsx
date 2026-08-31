"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LOGIN_PATH } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      setHasSession(Boolean(user));
      setCheckingSession(false);
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setMessage("Your password has been updated. You can log in with your new password now.");
    router.replace(`${LOGIN_PATH}?message=password_updated`);
  }

  if (checkingSession) {
    return <div className="min-h-[50vh] bg-surface-lavender" />;
  }

  if (!hasSession) {
    return (
      <section className="bg-surface-lavender py-7 sm:py-10 md:py-12">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset link expired</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This password reset link is invalid or has expired. Request a new reset link and try
              again.
            </p>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href="/forgot-password"
                className="font-semibold text-primary hover:text-primary-hover"
              >
                Request a new reset link
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-lavender py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Choose a new password</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Enter a new password for your FoodVault account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="text-sm font-bold text-foreground">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-bold text-foreground">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="rounded-lg border border-success/20 bg-success-light px-4 py-3 text-sm text-foreground">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
