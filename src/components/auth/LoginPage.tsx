"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { resendMemberSignupConfirmationAction } from "@/lib/member/signup-actions";
import {
  FORGOT_PASSWORD_PATH,
  getAuthSession,
  LOGIN_PATH,
  PARTNER_LOGIN_PATH,
  resolvePostLoginRedirect,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  wrong_account_type:
    "This email is registered as a FoodVault Partner account. Please use Partner Login instead.",
  oauth_cancelled:
    "Google sign-in was cancelled. You can try again or log in with your email and password.",
  oauth_failed:
    "We couldn't complete Google sign-in. Please try again or use your email and password.",
  oauth_setup_failed:
    "We signed you in with Google but couldn't finish setting up your account. Please try again or contact support.",
  verification_invalid:
    "That verification link is invalid or has expired. Request a new confirmation email from the login page.",
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(
    messageForAuthError(searchParams.get("error"))
  );
  const [submitting, setSubmitting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [confirmationResent, setConfirmationResent] = useState(false);

  const showResendConfirmation =
    Boolean(error) && /email not confirmed/i.test(error ?? "");

  useEffect(() => {
    getAuthSession().then((session) => {
      if (session) {
        router.replace(resolvePostLoginRedirect(session.accountType, nextPath));
        return;
      }
      setCheckingSession(false);
    });
  }, [router, nextPath]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signInWithEmail(email.trim(), password, "member");

    if (result.error) {
      setError(result.error);
      setConfirmationResent(false);
      setSubmitting(false);
      return;
    }

    router.push(resolvePostLoginRedirect("member", nextPath));
  };

  async function handleResendConfirmation() {
    if (!email.trim()) {
      setError("Enter your email address above, then resend the confirmation email.");
      return;
    }

    setResendingConfirmation(true);
    setConfirmationResent(false);
    const result = await resendMemberSignupConfirmationAction(email.trim());
    setResendingConfirmation(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setConfirmationResent(true);
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setConfirmationResent(false);
    const result = await signInWithGoogle({
      accountType: "member",
      nextPath: nextPath ?? undefined,
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
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome Back.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Log in to access your FoodVault membership, browse participating brands,
            save your favourites and manage your account.
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
                placeholder="you@example.com"
                className={`mt-2 ${inputClass}`}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-bold text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-2 ${inputClass}`}
              />
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
                href={`${FORGOT_PASSWORD_PATH}${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-sm font-semibold text-primary hover:text-primary-hover"
              >
                Forgot your password?
              </Link>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{error}</p>
                {showResendConfirmation ? (
                  <button
                    type="button"
                    onClick={() => void handleResendConfirmation()}
                    disabled={resendingConfirmation}
                    className="mt-3 font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60"
                  >
                    {resendingConfirmation
                      ? "Sending confirmation email..."
                      : "Resend confirmation email"}
                  </button>
                ) : null}
                {confirmationResent ? (
                  <p className="mt-2 text-success">
                    Confirmation email sent. Check your inbox and spam folder.
                  </p>
                ) : null}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="fv-btn-primary flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              New to FoodVault? Start your free trial and unlock exclusive member
              pricing from participating food, beverage and household brands.
            </p>
            <MemberSignupCtaLink
              variant="start-free-trial"
              className="mt-4 inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-background px-6 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary/5"
            />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Are you a FoodVault Partner? Access your Partner Dashboard to manage
            your business listing, member offer and account.
          </p>
          <Link
            href={PARTNER_LOGIN_PATH}
            className="mt-4 fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
          >
            Partner Login
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-surface-lavender">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
