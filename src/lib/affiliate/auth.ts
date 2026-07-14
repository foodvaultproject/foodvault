import { createClient } from "@/lib/supabase/client";
import {
  getAuthSession,
  isSupabaseConfigured,
  signInWithEmail,
  type AuthSession,
} from "@/lib/auth";
import type { AffiliateRegistrationInput } from "@/lib/affiliate/types";
import { AFFILIATE_DASHBOARD_PATH } from "@/lib/affiliate/paths";

const DEV_AFFILIATE_PREFIX = "foodvault-affiliate-record";

function getDevAffiliateKey(userId: string) {
  return `${DEV_AFFILIATE_PREFIX}:${userId}`;
}

function readDevAffiliate(userId: string) {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getDevAffiliateKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDevAffiliate(userId: string, record: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getDevAffiliateKey(userId), JSON.stringify(record));
}

export function seedDevAffiliateRecord(
  userId: string,
  record: {
    firstName: string;
    lastName: string;
    email: string;
  }
) {
  writeDevAffiliate(userId, {
    first_name: record.firstName.trim(),
    last_name: record.lastName.trim(),
    email: record.email.trim(),
    referral_code: "DEVAFF01",
  });
}

export async function getAffiliateSession(): Promise<AuthSession | null> {
  const session = await getAuthSession();
  if (!session || session.accountType !== "affiliate") {
    return null;
  }
  return session;
}

export async function isAffiliateAccount(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return readDevAffiliate(userId) !== null;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}

export async function createAffiliateAccount(
  input: AffiliateRegistrationInput
): Promise<{
  error?: string;
  needsEmailConfirmation?: true;
  email?: string;
  checkEmailPath?: string;
  success?: true;
}> {
  const { createAffiliateAccountAction } = await import(
    "@/lib/affiliate/signup-actions"
  );
  return createAffiliateAccountAction(input);
}

export async function signInAffiliateWithEmail(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const result = await signInWithEmail(email.trim(), password, "affiliate");
  if (result.error) {
    return { error: result.error };
  }
  return {};
}

export function resolveAffiliatePostLoginPath(nextPath?: string | null) {
  if (nextPath && nextPath.startsWith("/")) {
    return nextPath;
  }
  return AFFILIATE_DASHBOARD_PATH;
}
