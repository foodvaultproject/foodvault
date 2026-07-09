"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AffiliateGuestGuard } from "@/components/affiliate/AffiliateAuthGuard";
import {
  resolveAffiliatePostLoginPath,
  signInAffiliateWithEmail,
} from "@/lib/affiliate/auth";
import { AFFILIATE_REGISTER_PATH } from "@/lib/affiliate/paths";
import { getAuthSession } from "@/lib/auth";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function AffiliateLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAuthSession().then((session) => {
      if (session?.accountType === "affiliate") {
        router.replace(resolveAffiliatePostLoginPath());
      }
    });
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signInAffiliateWithEmail(email, password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push(resolveAffiliatePostLoginPath());
    router.refresh();
  }

  return (
    <AffiliateGuestGuard>
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Affiliate Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your referral links and click analytics.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-2 ${inputClass}`}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-2 ${inputClass}`}
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New affiliate?{" "}
            <Link
              href={AFFILIATE_REGISTER_PATH}
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </AffiliateGuestGuard>
  );
}
