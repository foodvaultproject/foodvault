"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPartnerAccountWithEmail, getPartnerSession, PARTNER_APPLICATION_PATH, signInPartnerWithGoogle } from "@/lib/partner-auth";
import { createDevSession, isSupabaseConfigured, PARTNER_LOGIN_PATH } from "@/lib/auth";
import { PartnerOnboardingProgress } from "./PartnerOnboardingProgress";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const partnerValueProps = [
  {
    title: "Free to list",
    description:
      "No listing fees, no monthly subscription, and no commission on product sales.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Own every customer",
    description:
      "Members purchase directly on your website. You keep the relationship, the data, and 100% of the sale.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    title: "Reach ready-to-buy members",
    description:
      "Get discovered by shoppers already looking for New Zealand brands offering exclusive member savings.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

type PasswordChecks = {
  minLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
};

function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
}

function RequirementItem({
  met,
  label,
  optional,
}: {
  met: boolean;
  label: string;
  optional?: boolean;
}) {
  return (
    <li className={`flex items-center gap-2 text-xs text-muted-foreground ${optional ? "italic" : ""}`}>
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          met ? "border-success bg-success text-white" : "border-border bg-background"
        }`}
      >
        {met && (
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </span>
      {label}
    </li>
  );
}

export function PartnerCreateAccountPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [communicationsAccepted, setCommunicationsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const passwordValid =
    passwordChecks.minLength &&
    passwordChecks.lowercase &&
    passwordChecks.uppercase &&
    passwordChecks.number;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  useEffect(() => {
    getPartnerSession().then((session) => {
      if (session) {
        router.replace(PARTNER_APPLICATION_PATH);
        return;
      }
      setCheckingSession(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError("Please meet all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted || !communicationsAccepted) {
      setError("Please accept both agreements to continue.");
      return;
    }

    setSubmitting(true);

    const result = await createPartnerAccountWithEmail(email.trim(), password);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      router.push(result.checkEmailPath ?? "/auth/check-email");
      return;
    }

    if (!isSupabaseConfigured()) {
      createDevSession(email.trim(), "partner");
    }

    router.push(PARTNER_APPLICATION_PATH);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const result = await signInPartnerWithGoogle();
    if (result?.error) {
      setError(result.error);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <PartnerOnboardingProgress currentStep={1} />

      <section className="bg-surface-lavender py-6 sm:py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="lg:py-4">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Partner Access
              </span>
              <h1 className="mt-5 text-[2.625rem] font-bold leading-[1.08] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3rem]">
                Create Your{" "}
                <span className="text-primary">FoodVault</span> Partner Account
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                List your New Zealand food, beverage or household brand on FoodVault for
                free. Create your partner account, build your business profile, and start
                reaching members looking for exclusive savings — with every purchase
                completed on your own website.
              </p>
              <p className="mt-3 text-sm font-medium text-foreground">
                Free to join · No listing fees · 0% commission on your sales
              </p>

              <div className="mt-8 space-y-4">
                {partnerValueProps.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-lg border border-border bg-background p-5 shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                      {item.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="inline-flex w-full items-center justify-center gap-3 rounded-sm border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
              >
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
                Sign up with Google
              </button>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Or
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="businessEmail" className="text-sm font-bold text-foreground">
                    Business Email Address <span className="text-primary">*</span>
                  </label>
                  <input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="text-sm font-bold text-foreground">
                      Password <span className="text-primary">*</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`mt-2 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="text-sm font-bold text-foreground">
                      Confirm Password <span className="text-primary">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`mt-2 ${inputClass}`}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4">
                  <ul className="grid gap-2 sm:grid-cols-2">
                    <RequirementItem met={passwordChecks.minLength} label="Minimum 8 characters" />
                    <RequirementItem met={passwordChecks.uppercase} label="One uppercase letter" />
                    <RequirementItem met={passwordChecks.lowercase} label="One lowercase letter" />
                    <RequirementItem met={passwordChecks.number} label="One number" />
                    <RequirementItem met label="Special character (Optional)" optional />
                  </ul>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-3 text-xs text-red-600">Passwords do not match.</p>
                  )}
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="font-semibold text-primary hover:text-primary-hover">
                      Partner Terms &amp; Conditions
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={communicationsAccepted}
                    onChange={(e) => setCommunicationsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    I agree to receive important account, application and partner
                    communications from FoodVault.
                  </span>
                </label>

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-sm px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating account..." : "Continue to Business Application"}
                  {!submitting && (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have a Partner account?{" "}
                <Link href={PARTNER_LOGIN_PATH} className="font-semibold text-primary hover:text-primary-hover">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
