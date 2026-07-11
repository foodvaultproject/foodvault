import { DEFAULT_TRIAL_LENGTH_DAYS, parseSettingNumber } from "@/lib/system-settings";

export function computeTrialEndsAt(
  trialStartedAt: string | null | undefined,
  trialLengthDays: number
): string | null {
  if (!trialStartedAt) {
    return null;
  }

  const start = new Date(trialStartedAt);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  end.setDate(end.getDate() + trialLengthDays);
  return end.toISOString();
}

/**
 * Aligns countdown display with the admin-configured trial length.
 * Uses trial_started_at + trial_length_days when available; otherwise falls back
 * to the stored trial_ends_at timestamp.
 */
export function resolveEffectiveTrialEndsAt(
  trialStartedAt: string | null | undefined,
  storedTrialEndsAt: string | null | undefined,
  trialLengthDays: number,
  fallbackTrialStartedAt?: string | null
): string | null {
  const trialStart = trialStartedAt ?? fallbackTrialStartedAt ?? null;
  const configuredEnd = computeTrialEndsAt(trialStart, trialLengthDays);
  if (configuredEnd) {
    return configuredEnd;
  }

  return storedTrialEndsAt ?? null;
}

export function normalizeTrialLengthDays(value: unknown): number {
  return parseSettingNumber(value, DEFAULT_TRIAL_LENGTH_DAYS);
}
