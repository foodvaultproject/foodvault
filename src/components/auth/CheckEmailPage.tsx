"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { AccountType } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/auth";
import { finalizeVerifiedSessionAction } from "@/lib/auth/finalize-verified-session";
import {
  clearPendingSignup,
  readPendingSignup,
} from "@/lib/auth/pending-signup-storage";
import {
  resolveVerifiedRedirectPath,
  signupPathForAccount,
} from "@/lib/auth/resolve-verified-redirect";
import { resendSignupVerificationAction } from "@/lib/auth/resend-verification";
import { getVerificationStatusAction } from "@/lib/auth/verification-status";
import { createClient } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 4000;
const RESEND_COOLDOWN_SECONDS = 60;

function parseAccountType(value: string | null): AccountType {
  if (value === "partner" || value === "affiliate") {
    return value;
  }
  return "member";
}

function friendlyErrorFromCode(code: string | null) {
  if (code === "verification_failed") {
    return "That link has expired. Tap Resend Email below and try again.";
  }
  if (code === "verification_setup_failed") {
    return "Your email is verified, but we hit a snag finishing setup. Try the button below or log in.";
  }
  return null;
}

function continueCopy(account: AccountType) {
  if (account === "partner") {
    return "continue your partner application";
  }
  if (account === "affiliate") {
    return "open your affiliate dashboard";
  }
  return "continue on the FoodVault homepage";
}

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email")?.trim() ?? "";
  const account = parseAccountType(searchParams.get("account"));
  const initialError = friendlyErrorFromCode(searchParams.get("error"));

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [actionError, setActionError] = useState<string | null>(initialError);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const pollingActiveRef = useRef(true);
  const redirectingRef = useRef(false);

  const stopPolling = useCallback(() => {
    pollingActiveRef.current = false;
  }, []);

  const finishRedirect = useCallback(
    (path: string) => {
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      stopPolling();
      setIsRedirecting(true);
      clearPendingSignup();
      // Full navigation ensures auth cookies are applied before the next page loads.
      window.location.assign(path);
    },
    [stopPolling]
  );

  const tryCompleteVerifiedSession = useCallback(async (options?: { silent?: boolean }) => {
    const finalize = await finalizeVerifiedSessionAction();
    if (!finalize.ready) {
      return false;
    }

    if (finalize.error) {
      if (!options?.silent) {
        setActionError(
          "You're verified, but we couldn't finish setting up your account. Please try again or log in."
        );
      }
      return false;
    }

    finishRedirect(finalize.redirectPath);
    return true;
  }, [finishRedirect]);

  const trySignInAndContinue = useCallback(async (options?: { silent?: boolean }) => {
    if (!email || !isSupabaseConfigured()) {
      return false;
    }

    const supabase = createClient();
    await supabase.auth.refreshSession();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email_confirmed_at) {
      await supabase.auth.refreshSession();
      return tryCompleteVerifiedSession(options);
    }

    const status = await getVerificationStatusAction(email, account);
    if (!status.found || !status.verified) {
      return false;
    }

    const pending = readPendingSignup(email);
    if (!pending?.password) {
      if (!options?.silent) {
        setActionError(
          "Your email looks verified. If you're not redirected automatically, log in with your password."
        );
      }
      return false;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: pending.password,
    });

    if (signInError) {
      if (!options?.silent) {
        setActionError(
          "Your email is verified. Please log in with your password to continue."
        );
      }
      return false;
    }

    await supabase.auth.refreshSession();

    clearPendingSignup();

    if (status.signupCompleted) {
      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();
      finishRedirect(
        resolveVerifiedRedirectPath(account, signedInUser?.user_metadata)
      );
      return true;
    }

    return tryCompleteVerifiedSession(options);
  }, [account, email, finishRedirect, tryCompleteVerifiedSession]);

  const handleVerifiedClick = useCallback(async () => {
    setChecking(true);
    setActionError(null);

    const completed = await trySignInAndContinue();
    if (!completed) {
      setActionError(
        "We haven't detected your verification yet. Open the email link, then try again in a moment."
      );
    }

    setChecking(false);
  }, [trySignInAndContinue]);

  const handleResend = useCallback(async () => {
    if (!email || cooldownSeconds > 0) {
      return;
    }

    setResending(true);
    setResent(false);
    setActionError(null);

    const result = await resendSignupVerificationAction(email, account);
    setResending(false);

    if ("error" in result && result.error) {
      setActionError(result.error);
      return;
    }

    setResent(true);
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  }, [account, cooldownSeconds, email]);

  const handleChangeEmail = useCallback(() => {
    stopPolling();
    clearPendingSignup();
    router.push(signupPathForAccount(account));
  }, [account, router, stopPolling]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (!email || !isSupabaseConfigured()) {
      return;
    }

    pollingActiveRef.current = true;
    redirectingRef.current = false;

    const poll = async () => {
      if (!pollingActiveRef.current || redirectingRef.current) {
        return;
      }

      await trySignInAndContinue({ silent: true });
    };

    void poll();
    const intervalId = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      stopPolling();
      window.clearInterval(intervalId);
    };
  }, [email, stopPolling, trySignInAndContinue]);

  const resendDisabled = resending || cooldownSeconds > 0 || !email || isRedirecting;

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-lavender px-4 py-10 sm:py-14">
      <div className="w-full max-w-lg">
        <div className="rounded-lg border border-border bg-background p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
            📧
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Check Your Email
          </h1>

          <p className="mt-3 text-base font-medium text-foreground">Almost there!</p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We&apos;ve sent a verification email to:
          </p>

          {email ? (
            <p className="mt-2 text-base font-semibold text-foreground">{email}</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn&apos;t show your email address here.
            </p>
          )}

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Click the verification link to activate your FoodVault account.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You can verify on any device.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            As soon as your email is verified we&apos;ll automatically sign you in and{" "}
            {continueCopy(account)}.
          </p>

          {isRedirecting ? (
            <p className="mt-6 text-sm font-medium text-success" role="status" aria-live="polite">
              Email verified — taking you into FoodVault…
            </p>
          ) : null}

          {resent ? (
            <p className="mt-6 rounded-lg border border-success/20 bg-success-light/40 px-4 py-3 text-sm font-medium text-foreground" role="status" aria-live="polite">
              Done — we&apos;ve sent another verification email. Check your inbox and spam folder.
            </p>
          ) : null}

          {actionError ? (
            <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void handleVerifiedClick()}
              disabled={checking || isRedirecting}
              className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
            >
              {checking ? "Checking…" : "I've Verified My Email"}
            </button>

            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resendDisabled}
              className="inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-background px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending
                ? "Sending…"
                : cooldownSeconds > 0
                  ? `Resend Email (${cooldownSeconds}s)`
                  : "Resend Email"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleChangeEmail}
            className="mt-6 text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            Use a different email address
          </button>

          {!email ? (
            <p className="mt-4 text-sm text-muted-foreground">
              <Link href={signupPathForAccount(account)} className="font-semibold text-primary hover:text-primary-hover">
                Return to signup
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-surface-lavender">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
