import type { AccountType } from "@/lib/auth";

const STORAGE_KEY = "foodvault-pending-signup";

export type PendingSignupState = {
  email: string;
  password: string;
  account: AccountType;
  savedAt: number;
};

const MAX_AGE_MS = 1000 * 60 * 60 * 24;

export function savePendingSignup(state: Omit<PendingSignupState, "savedAt">) {
  if (typeof window === "undefined") return;

  const payload: PendingSignupState = {
    ...state,
    savedAt: Date.now(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingSignup(expectedEmail?: string): PendingSignupState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PendingSignupState;
    if (!parsed.email || !parsed.password || !parsed.account) {
      return null;
    }

    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearPendingSignup();
      return null;
    }

    if (
      expectedEmail &&
      parsed.email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingSignup() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
