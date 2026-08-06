import { type AccountType, getAccountTypeFromMetadata } from "@/lib/auth";
import type { ActivePortal } from "@/lib/auth/active-portal";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = ""
) {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : fallback;
}

/** User has partner onboarding access (metadata flag or primary partner type). */
export function hasPartnerAccess(
  metadata: Record<string, unknown> | undefined
): boolean {
  if (!metadata) {
    return false;
  }

  if (metadata.partner_account_created === true) {
    return true;
  }

  return getAccountTypeFromMetadata(metadata) === "partner";
}

/** User has a member account (primary member type, not partner-only). */
export function hasMemberAccess(
  metadata: Record<string, unknown> | undefined
): boolean {
  if (!metadata) {
    return false;
  }

  return getAccountTypeFromMetadata(metadata) === "member";
}

export function isDualRoleUser(
  metadata: Record<string, unknown> | undefined
): boolean {
  return hasMemberAccess(metadata) && hasPartnerAccess(metadata);
}

export function getAvailableRoles(
  metadata: Record<string, unknown> | undefined
): AccountType[] {
  if (!metadata) {
    return [];
  }

  const roles: AccountType[] = [];
  const primaryType = getAccountTypeFromMetadata(metadata);

  if (primaryType === "member") {
    roles.push("member");
  }

  if (primaryType === "affiliate") {
    roles.push("affiliate");
  }

  if (hasPartnerAccess(metadata)) {
    if (!roles.includes("partner")) {
      roles.push("partner");
    }
  } else if (primaryType === "partner") {
    roles.push("partner");
  }

  return roles;
}

export function resolveActiveAccountType(
  metadata: Record<string, unknown> | undefined,
  activePortal: ActivePortal | null
): AccountType {
  const roles = getAvailableRoles(metadata);

  if (roles.length === 0) {
    return getAccountTypeFromMetadata(metadata);
  }

  if (roles.length === 1) {
    return roles[0]!;
  }

  if (activePortal && roles.includes(activePortal)) {
    return activePortal;
  }

  if (roles.includes("member")) {
    return "member";
  }

  return roles[0]!;
}

/** Merge partner flags without removing an existing member primary account type. */
export function buildEnablePartnerMetadata(
  existing: Record<string, unknown>
): Record<string, unknown> {
  const primaryType = getAccountTypeFromMetadata(existing);
  const updates: Record<string, unknown> = {
    partner_account_created: true,
  };

  if (existing.onboarding_step === undefined) {
    updates.onboarding_step = 2;
  }

  if (primaryType !== "member") {
    updates.account_type = "partner";
    if (!readMetadataString(existing, "signup_completed_at")) {
      updates.signup_completed_at = new Date().toISOString();
    }
  }

  return updates;
}

export function isUserAlreadyRegisteredError(message: string): boolean {
  return /already registered|already been registered|user already exists/i.test(
    message
  );
}
