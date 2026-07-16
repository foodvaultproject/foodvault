"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  FORGOT_PASSWORD_PATH,
  getAuthSession,
  resolvePostLoginRedirect,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth";
import {
  PARTNER_CREATE_ACCOUNT_PATH,
  PARTNER_APPLICATION_PATH,
  resolvePartnerPostLoginPath,
} from "@/lib/partner-auth";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  wrong_account_type:
    "This email is registered as a FoodVault member account. Please use the member login page instead.",
  oauth_cancelled:
    "Google sign-in was cancelled. You can try again or log in with your email and password.",
  oauth_failed:
    "We couldn't complete Google sign-in. Please try again or use your email and password.",
};

function messageForAuthError(code: string | null): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? "Something went wrong. Please try again.";
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function PartnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(
    messageForAuthError(searchParams.get("error"))
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAuthSession().then(async (session) => {
      if (session?.accountType === "partner") {
        const path = await resolvePartnerPostLoginPath(session.id, nextPath);
        router.replace(path);
        return;
      }
      setCheckingSession(false);
    });
  }, [router, nextPath]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signInWithEmail(email.trim(), password, "partner");

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    const session = await getAuthSession();
    const path = session
      ? await resolvePartnerPostLoginPath(session.id, nextPath)
      : resolvePostLoginRedirect("partner", nextPath);
    router.push(path);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const result = await signInWithGoogle({
      accountType: "partner",
      nextPath: nextPath ?? PARTNER_APPLICATION_PATH,
    });

    if (result?.error) {
      setError(result.error);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface-lavender">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <section className="bg-surface-lavender py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              FoodVault Partners
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Partner Login
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Log in to manage your FoodVault business listing, member offer and
              partner account.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-sm border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Or continue with email
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="businessEmail" className="text-sm font-bold text-foreground">
                  Business Email Address
                </label>
                <input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.co.nz"
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-bold text-foreground">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <Link
                  href={`${FORGOT_PASSWORD_PATH}?account=partner${email ? `&email=${encodeURIComponent(email)}` : ""}`}
                  className="text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  Forgot your password?
                </Link>
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Log In"}
              </button>
            </form>
          </div>

          <div className="border-t border-primary/10 bg-primary/5 px-6 py-6 sm:px-8 sm:py-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              New to FoodVault? Create a Partner account to apply for listing on
              FoodVault and start reaching members looking for better value from
              participating food, beverage and household brands.
            </p>
            <Link
              href={PARTNER_CREATE_ACCOUNT_PATH}
              className="mt-4 inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-background px-6 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Create Partner Account
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:p-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Need help? Questions about becoming a FoodVault Partner?
          </p>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
          >
            Contact Partner Support
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PartnerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-surface-lavender">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <PartnerLoginForm />
    </Suspense>
  );
}
