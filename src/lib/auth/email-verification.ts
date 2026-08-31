import type { AccountType } from "@/lib/auth";
import { RESET_PASSWORD_PATH } from "@/lib/auth";
import { authEmailCandidates } from "@/lib/auth/email-aliases";
import {
  releaseAuthEmailSend,
  reserveAuthEmailSend,
} from "@/lib/auth/bot-protection/email-dedup";
import { findAuthUserByEmail } from "@/lib/auth/find-user-by-email";
import { renderMemberPasswordResetEmail, renderMemberVerifyEmail } from "@/lib/email-templates/render";
import { getEmailAppUrl, sendPlatformEmailSafe } from "@/lib/email-templates/send";
import { createAdminClient } from "@/lib/supabase/admin";

export const AUTH_CONFIRM_PATH = "/auth/confirm";
export const AUTH_CHECK_EMAIL_PATH = "/auth/check-email";

export type VerificationLinkType = "signup" | "invite";

export type AuthConfirmLinkType = VerificationLinkType | "recovery";

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
  type: AuthConfirmLinkType;
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
  const dedup = await reserveAuthEmailSend("signup_verification", params.to);
  if (dedup.duplicate) {
    return {};
  }

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
    await releaseAuthEmailSend("signup_verification", params.to);
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

function isUserNotFoundError(message: string) {
  return /user not found|unable to find user|user does not exist/i.test(message);
}

function readHashedToken(data: {
  properties?: { hashed_token?: string | null; action_link?: string | null };
  hashed_token?: string | null;
  action_link?: string | null;
} | null) {
  const hashed = data?.properties?.hashed_token || data?.hashed_token;
  if (hashed) return hashed;

  const actionLink = data?.properties?.action_link || data?.action_link;
  if (!actionLink) return null;

  try {
    const url = new URL(actionLink);
    return url.searchParams.get("token_hash") || url.searchParams.get("token");
  } catch {
    return null;
  }
}

function readFirstName(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return null;
  const firstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  if (firstName) return firstName;
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  if (fullName) return fullName.split(/\s+/)[0] ?? null;
  return null;
}

export async function generatePasswordRecoveryLink(email: string) {
  const admin = createAdminClient();
  if (!admin) {
    return {
      error: "Password reset is not configured in this environment.",
      step: "admin_client",
    } satisfies AuthStepError;
  }

  const trimmedEmail = email.trim();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: trimmedEmail,
    options: {
      redirectTo: `${getSiteUrl()}${AUTH_CONFIRM_PATH}`,
    },
  });

  if (error) {
    if (isUserNotFoundError(error.message)) {
      return { notFound: true as const };
    }

    return formatAuthStepError("admin.generateLink.recovery", error);
  }

  const tokenHash = readHashedToken(data);
  if (!tokenHash) {
    return {
      error: "Unable to generate password reset link.",
      step: "admin.generateLink.recovery",
    } satisfies AuthStepError;
  }

  const metadata = (data.user?.user_metadata ?? {}) as Record<string, unknown>;

  return { tokenHash, firstName: readFirstName(metadata) };
}

export async function sendPasswordResetEmail(params: {
  to: string;
  firstName?: string | null;
  resetUrl: string;
}) {
  const dedup = await reserveAuthEmailSend("password_reset", params.to);
  if (dedup.duplicate) {
    return {};
  }

  const appUrl = getEmailAppUrl();
  const result = await sendPlatformEmailSafe({
    to: params.to,
    rendered: renderMemberPasswordResetEmail({
      appUrl,
      firstName: params.firstName,
      resetUrl: params.resetUrl,
    }),
  });

  if (!result.sent) {
    await releaseAuthEmailSend("password_reset", params.to);
    return {
      error:
        "We could not send the password reset email right now. Please try again in a few minutes.",
      step: "resend.sendPlatformEmail",
    } satisfies AuthStepError;
  }

  return {};
}

export async function issueAndSendPasswordReset(params: {
  email: string;
  account: AccountType;
  firstName?: string | null;
}) {
  const candidates = authEmailCandidates(params.email);
  if (candidates.length === 0) {
    return { success: true as const };
  }

  let resolvedEmail: string | null = null;
  for (const candidate of candidates) {
    try {
      const existingUser = await findAuthUserByEmail(candidate);
      if (existingUser?.email) {
        resolvedEmail = existingUser.email;
        break;
      }
    } catch (error) {
      console.warn("[password-reset] Could not look up auth user", {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  const emailsToTry = resolvedEmail
    ? [resolvedEmail]
    : candidates;

  let lastError: AuthStepError | null = null;
  for (const email of emailsToTry) {
    const linkResult = await generatePasswordRecoveryLink(email);

    if ("notFound" in linkResult && linkResult.notFound) {
      continue;
    }

    if ("error" in linkResult) {
      lastError = linkResult;
      console.error("[password-reset] generateLink.recovery failed", {
        step: linkResult.step,
        code: linkResult.code,
        status: linkResult.status,
      });
      continue;
    }

    const resetUrl = buildConfirmUrl({
      tokenHash: linkResult.tokenHash,
      type: "recovery",
      next: RESET_PASSWORD_PATH,
      account: params.account,
    });

    const sendResult = await sendPasswordResetEmail({
      to: email,
      firstName: params.firstName ?? linkResult.firstName,
      resetUrl,
    });

    if ("error" in sendResult) {
      return sendResult;
    }

    return { success: true as const };
  }

  if (lastError) {
    return lastError;
  }

  return { success: true as const };
}
