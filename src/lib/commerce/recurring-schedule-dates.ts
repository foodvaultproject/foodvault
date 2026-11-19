export const SCHEDULE_FREQUENCIES = [
  "WEEKLY",
  "FORTNIGHTLY",
  "MONTHLY",
  "CUSTOM_INTERVAL",
  "CUSTOM_DATES",
] as const;

export type ScheduleFrequency = (typeof SCHEDULE_FREQUENCIES)[number];
export type ScheduleStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export function aucklandToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addIsoDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function addIsoMonths(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
  cursor.setUTCDate(Math.min(day, lastDay));
  return cursor.toISOString().slice(0, 10);
}

export function advanceScheduleDate(
  isoDate: string,
  frequency: ScheduleFrequency,
  intervalDays: number | null
): string {
  if (frequency === "WEEKLY") return addIsoDays(isoDate, 7);
  if (frequency === "FORTNIGHTLY") return addIsoDays(isoDate, 14);
  if (frequency === "MONTHLY") return addIsoMonths(isoDate, 1);
  if (frequency === "CUSTOM_INTERVAL") {
    const days = Math.trunc(intervalDays ?? 0);
    return addIsoDays(isoDate, days >= 1 ? days : 1);
  }
  return isoDate;
}

export function firstRunOnOrAfter(
  startDate: string,
  today: string,
  frequency: ScheduleFrequency,
  intervalDays: number | null
): string {
  let cursor = startDate;
  for (let i = 0; i < 500 && cursor < today; i += 1) {
    const next = advanceScheduleDate(cursor, frequency, intervalDays);
    if (next === cursor) break;
    cursor = next;
  }
  return cursor;
}

export function frequencyLabel(
  frequency: ScheduleFrequency,
  intervalDays: number | null
): string {
  if (frequency === "WEEKLY") return "Weekly";
  if (frequency === "FORTNIGHTLY") return "Fortnightly";
  if (frequency === "MONTHLY") return "Monthly";
  if (frequency === "CUSTOM_INTERVAL") return `Every ${intervalDays ?? "?"} days`;
  return "Custom dates";
}
