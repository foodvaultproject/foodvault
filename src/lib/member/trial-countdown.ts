export type TrialCountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
};

export function getTrialCountdownParts(
  trialEndsAt: string | null | undefined,
  now = Date.now()
): TrialCountdownParts {
  if (!trialEndsAt) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const end = new Date(trialEndsAt).getTime();
  if (Number.isNaN(end)) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const diff = Math.max(0, end - now);
  if (diff === 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, expired: false };
}

export function formatTrialCountdownLabel(parts: TrialCountdownParts) {
  if (parts.expired) return "Trial ended";

  const segments = [
    `${parts.days} ${parts.days === 1 ? "day" : "days"}`,
    `${parts.hours} ${parts.hours === 1 ? "hour" : "hours"}`,
    `${parts.minutes} ${parts.minutes === 1 ? "minute" : "minutes"}`,
  ];

  return `${segments.join(", ")} remaining`;
}
