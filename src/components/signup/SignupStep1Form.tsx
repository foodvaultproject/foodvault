"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignupField, SignupPasswordField, SignupProgress, inputClass } from "@/components/signup/SignupProgress";
import {
  createDevSession,
  isSupabaseConfigured,
  LOGIN_PATH,
  signInWithGoogle,
} from "@/lib/auth";
import { createMemberAccountAction } from "@/lib/member/signup-actions";
import { savePendingSignup } from "@/lib/auth/pending-signup-storage";
import {
  formatFreeTrialLabel,
  formatMembershipPriceMonthly,
  type MembershipSettings,
} from "@/lib/member/pricing";
import { locale } from "@/lib/locale";

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

export function SignupStep1Form({ settings }: { settings: MembershipSettings }) {
  const trialLabel = formatFreeTrialLabel(settings.trialLengthDays);
  const priceLabel = formatMembershipPriceMonthly(settings.membershipPriceMonthly);
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<string>(locale.country);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"trial" | "membership" | "google" | null>(null);

  const showPasswordMatchStatus = confirmPassword.length > 0;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const confirmPasswordTone = showPasswordMatchStatus
    ? passwordsMatch
      ? "match"
      : "mismatch"
    : "default";

  const formData = {
    firstName,
    lastName,
    email,
    country,
    password,
    confirmPassword,
    marketingOptIn,
  };

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    const result = await signInWithGoogle({
      accountType: "member",
      nextPath: "/signup/welcome",
    });
    if (result.error) {
      setError(result.error);
      setLoading(null);
    }
  }

  async function submit(mode: "trial" | "membership") {
    setError(null);
    setLoading(mode);
    const result = await createMemberAccountAction(formData, mode);
    if ("needsEmailConfirmation" in result && result.needsEmailConfirmation) {
      savePendingSignup({
        email: email.trim(),
        password,
        account: "member",
      });
      router.push(result.checkEmailPath ?? "/auth/check-email");
      setLoading(null);
      return;
    }
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(null);
      return;
    }
    if (!isSupabaseConfigured()) {
      createDevSession(email.trim(), "member");
      router.push(mode === "trial" ? "/signup/welcome" : "/signup/membership");
      router.refresh();
      setLoading(null);
      return;
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="lg:py-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-success-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success">
          ★ Membership Now Open in NZ
        </span>
        <h1 className="mt-6 text-[2.625rem] font-bold leading-[1.08] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3rem]">
          Pay Less For The Food You{" "}
          <span className="text-primary">Already Buy</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Unlock exclusive member pricing from independent food and beverage brands
          across New Zealand. Join once. Save every month.
        </p>
        <div className="mt-8 space-y-4">
          {[
            {
              title: "Save Every Month",
              description: "Access member-only pricing.",
              icon: "💰",
            },
            {
              title: "Discover New Brands",
              description:
                "Find exciting companies across Aotearoa making world-class products.",
              icon: "🧭",
            },
            {
              title: "Cancel Anytime",
              description:
                "We believe in our value. No lock-ins, no hidden exit fees, ever.",
              icon: "🔓",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex gap-4 rounded-lg border border-border bg-background p-5 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-lg">
                {card.icon}
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">{card.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SignupProgress step={1} stepLabel="Account Security" />
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Your Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a {trialLabel}, or join for {priceLabel}. Secure your access to
            exclusive vaulted food savings.
          </p>

          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={loading !== null}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-sm border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
          >
            {loading === "google" ? (
              "Connecting..."
            ) : (
              <>
                <GoogleIcon />
                Sign up with Google
              </>
            )}
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Or continue with email
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit("trial");
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupField
                label="First Name"
                id="firstName"
                value={firstName}
                onChange={setFirstName}
                placeholder="Enter first name"
              />
              <SignupField
                label="Last Name"
                id="lastName"
                value={lastName}
                onChange={setLastName}
                placeholder="Enter last name"
              />
            </div>
            <SignupField
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@example.com"
            />
            <div>
              <label htmlFor="country" className="text-sm font-medium text-foreground">
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`mt-2 ${inputClass}`}
              >
                <option value="New Zealand">New Zealand</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SignupPasswordField
                label="Password"
                id="password"
                value={password}
                onChange={setPassword}
              />
              <SignupPasswordField
                label="Confirm Password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                tone={confirmPasswordTone}
              />
            </div>
            {showPasswordMatchStatus ? (
              <p
                className={`flex items-center gap-2 text-xs font-medium ${
                  passwordsMatch ? "text-success" : "text-red-600"
                }`}
                role="status"
                aria-live="polite"
              >
                {passwordsMatch ? (
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                )}
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </p>
            ) : null}

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-1 rounded border-border"
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                I&apos;d like to receive member updates, grocery insights, and vaulted
                savings alerts. (Optional)
              </span>
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading !== null}
              className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
            >
              {loading === "trial" ? "Creating account..." : `Start ${formatFreeTrialLabel(settings.trialLengthDays)}`}
            </button>

            <div className="relative py-2 text-center">
              <span className="bg-background px-3 text-xs font-semibold uppercase text-muted-foreground">
                Or
              </span>
              <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
            </div>

            <button
              type="button"
              disabled={loading !== null}
              onClick={() => void submit("membership")}
              className="inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-background px-4 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
            >
              {loading === "membership" ? "Creating account..." : "Continue to Membership"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-success/20 bg-success-light/40 px-4 py-3 text-sm text-foreground">
            🔒 Your information is encrypted and securely stored.
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={LOGIN_PATH} className="font-semibold text-primary hover:text-primary-hover">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
