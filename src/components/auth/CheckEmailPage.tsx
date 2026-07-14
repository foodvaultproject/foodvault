"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { AccountType } from "@/lib/auth";
import {
  AFFILIATE_LOGIN_PATH,
  LOGIN_PATH,
  PARTNER_LOGIN_PATH,
} from "@/lib/auth";
import { resendSignupVerificationAction } from "@/lib/auth/resend-verification";

const ACCOUNT_COPY: Record<
  AccountType,
  { title: string; description: string; loginPath: string }
> = {
  member: {
    title: "Check your email",
    description:
      "We sent a verification link to your inbox. Confirm your email to sign in and start using FoodVault.",
    loginPath: LOGIN_PATH,
  },
  partner: {
    title: "Verify your partner account",
    description:
      "We sent a verification link to your inbox. Confirm your email to continue your partner application.",
    loginPath: PARTNER_LOGIN_PATH,
  },
  affiliate: {
    title: "Verify your affiliate account",
    description:
      "We sent a verification link to your inbox. Confirm your email to access your affiliate dashboard.",
    loginPath: AFFILIATE_LOGIN_PATH,
  },
};

function parseAccountType(value: string | null): AccountType {
  if (value === "partner" || value === "affiliate") {
    return value;
  }
  return "member";
}

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const account = parseAccountType(searchParams.get("account"));
  const errorCode = searchParams.get("error");
  const copy = ACCOUNT_COPY[account];

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(
    errorCode === "verification_failed"
      ? "That verification link is invalid or has expired. Request a new one below."
      : errorCode === "verification_setup_failed"
        ? "Your email was verified, but we could not finish account setup. Try signing in or contact support."
        : null
  );

  async function handleResend() {
    if (!email.trim()) {
      setError("We could not determine your email address. Return to signup and try again.");
      return;
    }

    setResending(true);
    setResent(false);
    setError(null);

    const result = await resendSignupVerificationAction(email.trim(), account);
    setResending(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setResent(true);
  }

  return (
    <section className="bg-surface-lavender py-10 sm:py-14">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {copy.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {copy.description}
          </p>

          {email ? (
            <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground">
              Sent to <span className="font-semibold">{email}</span>
            </p>
          ) : null}

          <p className="mt-4 text-sm text-muted-foreground">
            Open the email from FoodVault and tap <strong>Verify Email Address</strong>.
            Check your spam folder if you do not see it within a few minutes.
          </p>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {resent ? (
            <p className="mt-4 text-sm font-medium text-success">
              Verification email sent. Check your inbox and spam folder.
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending || !email}
              className="fv-btn-primary inline-flex flex-1 items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
            <button
              type="button"
              onClick={() => router.push(copy.loginPath)}
              className="inline-flex flex-1 items-center justify-center rounded-sm border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
            >
              Back to login
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Wrong email?{" "}
            <Link href={copy.loginPath} className="font-semibold text-primary hover:text-primary-hover">
              Sign in or sign up again
            </Link>
          </p>
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
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
