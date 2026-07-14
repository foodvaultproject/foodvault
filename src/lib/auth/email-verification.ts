import type { AccountType } from "@/lib/auth";
import { renderMemberVerifyEmail } from "@/lib/email-templates/render";
import { getEmailAppUrl, sendPlatformEmailSafe } from "@/lib/email-templates/send";
import { createAdminClient } from "@/lib/supabase/admin";

export const AUTH_CONFIRM_PATH = "/auth/confirm";
export const AUTH_CHECK_EMAIL_PATH = "/auth/check-email";

export type VerificationLinkType = "signup" | "invite";

export type AuthStepError = {
  error: string;
  step: string;
  code?: string;
  status?: number;
};

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.foodvault.co.nz").replace(
    /\/$/,
    ""
  );
}

export function buildConfirmUrl(params: {
  tokenHash: string;
  type: VerificationLinkType;
  next: string;
  account: AccountType;
}) {
  const url = new URL(`${getSiteUrl()}${AUTH_CONFIRM_PATH}`);
  url.searchParams.set("token_hash", params.tokenHash);
  url.searchParams.set("type", params.type);
  url.searchParams.set("next", params.next);
  url.searchParams.set("account", params.account);
  return url.toString();
}

function formatAuthStepError(
  step: string,
  error: { message: string; code?: string; status?: number }
): AuthStepError {
  const message = error.message;
  const isEmailRateLimit =
    error.code === "over_email_send_rate_limit" ||
    /email rate limit exceeded/i.test(message);

  if (isEmailRateLimit) {
    return {
      step,
      code: error.code,
      status: error.status,
      error:
        `Supabase Auth blocked ${step} with "email rate limit exceeded". ` +
        "This is Supabase's built-in email quota (not Resend). " +
        "Admin generateLink should not send mail — if you see this on the new flow, " +
        "check Supabase Dashboard → Authentication → Logs for the exact endpoint, " +
        "wait for the hourly quota to reset, or configure custom SMTP to raise limits.",
    };
  }

  return {
    step,
    code: error.code,
    status: error.status,
    error: message,
  };
}

/**
 * Creates (or refreshes) an unverified account and returns a Supabase verification
 * token via the admin generateLink API only. Does not call signUp(), resend(), or
 * any client Auth API that triggers Supabase's mailer.
 */
export async function generateSignupVerificationLink(params: {
  email: string;
  password?: string;
  userMetadata?: Record<string, unknown>;
  linkType: VerificationLinkType;
}) {
  const admin = createAdminClient();
  if (!admin) {
    return {
      error: "Verification is not configured in this environment.",
      step: "admin_client",
    } satisfies AuthStepError;
  }

  const redirectTo = `${getSiteUrl()}${AUTH_CONFIRM_PATH}`;
  const email = params.email.trim();

  if (params.linkType === "signup") {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password: params.password!,
      options: {
        redirectTo,
        data: params.userMetadata,
      },
    });

    if (error) {
      return formatAuthStepError("admin.generateLink.signup", error);
    }

    const tokenHash = data.properties?.hashed_token;
    if (!tokenHash) {
      return {
        error: "Unable to generate verification link.",
        step: "admin.generateLink.signup",
      } satisfies AuthStepError;
    }

    return { tokenHash, linkType: "signup" as const };
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo,
      data: params.userMetadata,
    },
  });

  if (error) {
    return formatAuthStepError("admin.generateLink.invite", error);
  }

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) {
    return {
      error: "Unable to generate verification link.",
      step: "admin.generateLink.invite",
    } satisfies AuthStepError;
  }

  return { tokenHash, linkType: "invite" as const };
}

export async function sendSignupVerificationEmail(params: {
  to: string;
  firstName?: string | null;
  verificationUrl: string;
}) {
  const appUrl = getEmailAppUrl();
  const result = await sendPlatformEmailSafe({
    to: params.to,
    rendered: renderMemberVerifyEmail({
      appUrl,
      firstName: params.firstName,
      verificationUrl: params.verificationUrl,
    }),
  });

  if (!result.sent) {
    return {
      error:
        "Your account was created, but we could not send the verification email via Resend. Please try resending it.",
      step: "resend.sendPlatformEmail",
    } satisfies AuthStepError;
  }

  return {};
}

export async function issueAndSendSignupVerification(params: {
  email: string;
  password?: string;
  firstName?: string | null;
  next: string;
  account: AccountType;
  linkType: VerificationLinkType;
  userMetadata?: Record<string, unknown>;
}) {
  const linkResult = await generateSignupVerificationLink({
    email: params.email,
    password: params.password,
    userMetadata: params.userMetadata,
    linkType: params.linkType,
  });

  if ("error" in linkResult) {
    return linkResult;
  }

  const verificationUrl = buildConfirmUrl({
    tokenHash: linkResult.tokenHash,
    type: linkResult.linkType,
    next: params.next,
    account: params.account,
  });

  return sendSignupVerificationEmail({
    to: params.email,
    firstName: params.firstName,
    verificationUrl,
  });
}
