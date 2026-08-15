import type { AccountType, AuthSession } from "@/lib/auth";

export const AUTH_STATE_COOKIE = "fv-auth-state";
export const MEMBERSHIP_STATE_COOKIE = "fv-membership-state";

export type AuthStateHint = "guest" | "member" | "partner" | "affiliate" | "admin";
export type MembershipStateHint = "none" | "active";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function parseAuthStateHint(value: string | null): AuthStateHint | null {
  if (
    value === "guest" ||
    value === "member" ||
    value === "partner" ||
    value === "affiliate" ||
    value === "admin"
  ) {
    return value;
  }

  return null;
}

function parseMembershipStateHint(value: string | null): MembershipStateHint | null {
  if (value === "none" || value === "active") {
    return value;
  }

  return null;
}

export function readAuthStateHintClient(): AuthStateHint | null {
  return parseAuthStateHint(readCookie(AUTH_STATE_COOKIE));
}

export function readMembershipStateHintClient(): MembershipStateHint | null {
  return parseMembershipStateHint(readCookie(MEMBERSHIP_STATE_COOKIE));
}

export function setSessionHintsClient(hints: {
  auth: AuthStateHint;
  membership?: MembershipStateHint;
}) {
  writeCookie(AUTH_STATE_COOKIE, hints.auth);
  if (hints.membership) {
    writeCookie(MEMBERSHIP_STATE_COOKIE, hints.membership);
  }
}

export function clearSessionHintsClient() {
  clearCookie(AUTH_STATE_COOKIE);
  clearCookie(MEMBERSHIP_STATE_COOKIE);
}

export function authHintFromAccountType(accountType: AccountType): AuthStateHint {
  return accountType;
}

export function membershipHintFromView(view: {
  isActiveMember: boolean;
}): MembershipStateHint {
  if (view.isActiveMember) return "active";
  return "none";
}

export function syncSessionHintsFromSession(
  session: AuthSession | null,
  membership?: { isActiveMember: boolean }
) {
  if (!session) {
    clearSessionHintsClient();
    setSessionHintsClient({ auth: "guest", membership: "none" });
    return;
  }

  if (session.isDev) {
    setSessionHintsClient({
      auth: authHintFromAccountType(session.accountType),
      membership: membership ? membershipHintFromView(membership) : undefined,
    });
    return;
  }

  setSessionHintsClient({
    auth: authHintFromAccountType(session.accountType),
    membership: membership ? membershipHintFromView(membership) : undefined,
  });
}

export type HomeAudienceHint =
  | "unknown"
  | "guest"
  | "partner"
  | "active-member";

export function resolveInitialHomeAudience(): HomeAudienceHint {
  const authHint = readAuthStateHintClient();
  const membershipHint = readMembershipStateHintClient();

  if (authHint === "guest") {
    return "guest";
  }

  if (authHint === "partner") {
    return "partner";
  }

  if (authHint === "member") {
    if (membershipHint === "active") return "active-member";
    return "unknown";
  }

  if (authHint === "admin") {
    return "guest";
  }

  return "unknown";
}
