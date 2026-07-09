"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AffiliateGuestGuard } from "@/components/affiliate/AffiliateAuthGuard";
import {
  createAffiliateAccount,
  resolveAffiliatePostLoginPath,
} from "@/lib/affiliate/auth";
import { AFFILIATE_LOGIN_PATH } from "@/lib/affiliate/paths";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
}

export function AffiliateRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "New Zealand",
    termsAccepted: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = useMemo(() => getPasswordChecks(form.password), [form.password]);
  const passwordValid =
    passwordChecks.minLength &&
    passwordChecks.lowercase &&
    passwordChecks.uppercase &&
    passwordChecks.number;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError("Please meet all password requirements.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.termsAccepted) {
      setError("Please agree to the Affiliate Terms & Conditions.");
      return;
    }

    setSubmitting(true);
    const result = await createAffiliateAccount({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      country: form.country,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push(resolveAffiliatePostLoginPath());
  }

  return (
    <AffiliateGuestGuard>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Create Affiliate Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Joining is free and approval is automatic. Payout details are collected later through
            Stripe Connect when you are ready to receive commissions.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm((current) => ({ ...current, firstName: e.target.value }))}
                  className={`mt-2 ${inputClass}`}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm((current) => ({ ...current, lastName: e.target.value }))}
                  className={`mt-2 ${inputClass}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                className={`mt-2 ${inputClass}`}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                  className={`mt-2 ${inputClass}`}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, confirmPassword: e.target.value }))
                  }
                  className={`mt-2 ${inputClass}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm((current) => ({ ...current, country: e.target.value }))}
                className={`mt-2 ${inputClass}`}
                required
              />
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) =>
                  setForm((current) => ({ ...current, termsAccepted: e.target.checked }))
                }
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                required
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                I agree to the{" "}
                <Link href="/affiliate-terms" className="font-semibold text-primary hover:text-primary-hover">
                  Affiliate Terms &amp; Conditions
                </Link>
                .
              </span>
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create Affiliate Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already an affiliate?{" "}
            <Link href={AFFILIATE_LOGIN_PATH} className="font-semibold text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AffiliateGuestGuard>
  );
}
