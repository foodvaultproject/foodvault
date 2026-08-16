export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const WEEKDAY_SHORT_LABELS: Record<Weekday, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export type DayHours = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  is24Hours: boolean;
};

export type WeeklySchedule = Record<Weekday, DayHours>;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function emptyDayHours(): DayHours {
  return {
    isOpen: false,
    openTime: "09:00",
    closeTime: "17:00",
    is24Hours: false,
  };
}

export function emptyWeeklySchedule(): WeeklySchedule {
  return {
    monday: emptyDayHours(),
    tuesday: emptyDayHours(),
    wednesday: emptyDayHours(),
    thursday: emptyDayHours(),
    friday: emptyDayHours(),
    saturday: emptyDayHours(),
    sunday: emptyDayHours(),
  };
}

function normalizeTime(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return TIME_PATTERN.test(trimmed) ? trimmed : fallback;
}

function normalizeDayHours(value: unknown): DayHours {
  const fallback = emptyDayHours();
  if (!value || typeof value !== "object") return fallback;

  const row = value as Partial<DayHours>;
  const is24Hours = Boolean(row.is24Hours);
  const isOpen = Boolean(row.isOpen) || is24Hours;

  return {
    isOpen,
    is24Hours,
    openTime: normalizeTime(row.openTime, fallback.openTime),
    closeTime: normalizeTime(row.closeTime, fallback.closeTime),
  };
}

export function isWeeklySchedule(value: unknown): value is WeeklySchedule {
  if (!value || typeof value !== "object") return false;
  return WEEKDAYS.every((day) => day in value);
}

export function parseWeeklySchedule(raw: string | null | undefined): WeeklySchedule {
  const fallback = emptyWeeklySchedule();
  const trimmed = raw?.trim() ?? "";
  if (!trimmed.startsWith("{")) return fallback;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!isWeeklySchedule(parsed)) return fallback;

    return WEEKDAYS.reduce((schedule, day) => {
      schedule[day] = normalizeDayHours(parsed[day]);
      return schedule;
    }, emptyWeeklySchedule());
  } catch {
    return fallback;
  }
}

export function serializeWeeklySchedule(schedule: WeeklySchedule): string {
  const normalized = WEEKDAYS.reduce((next, day) => {
    next[day] = normalizeDayHours(schedule[day]);
    return next;
  }, emptyWeeklySchedule());

  return JSON.stringify(normalized);
}

export function serializeOpeningHoursForStorage(raw: string | null | undefined) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;

  if (trimmed.startsWith("{")) {
    return serializeWeeklySchedule(parseWeeklySchedule(trimmed));
  }

  return trimmed;
}

export function hasAnyOpenDay(schedule: WeeklySchedule) {
  return WEEKDAYS.some((day) => schedule[day].isOpen);
}

export function isCompleteWeeklySchedule(schedule: WeeklySchedule) {
  if (!hasAnyOpenDay(schedule)) return false;

  return WEEKDAYS.every((day) => {
    const hours = schedule[day];
    if (!hours.isOpen) return true;
    if (hours.is24Hours) return true;
    return TIME_PATTERN.test(hours.openTime) && TIME_PATTERN.test(hours.closeTime);
  });
}

export function copyMondayHoursToOpenDays(schedule: WeeklySchedule): WeeklySchedule {
  const monday = normalizeDayHours(schedule.monday);

  return WEEKDAYS.reduce((next, day) => {
    const current = normalizeDayHours(schedule[day]);
    if (!current.isOpen) {
      next[day] = current;
      return next;
    }

    next[day] = {
      ...current,
      openTime: monday.openTime,
      closeTime: monday.closeTime,
      is24Hours: monday.is24Hours,
    };
    return next;
  }, emptyWeeklySchedule());
}

export function formatTimeLabel(value: string) {
  if (!TIME_PATTERN.test(value)) return value;
  const [hourRaw, minute] = value.split(":");
  const hour = Number(hourRaw);
  const suffix = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute}${suffix}`;
}

export function formatDayHoursLabel(hours: DayHours) {
  if (!hours.isOpen) return "Closed";
  if (hours.is24Hours) return "Open 24 hours";
  return `${formatTimeLabel(hours.openTime)}–${formatTimeLabel(hours.closeTime)}`;
}

export function formatWeeklyScheduleLines(schedule: WeeklySchedule) {
  return WEEKDAYS.map((day) => ({
    day,
    label: WEEKDAY_SHORT_LABELS[day],
    hours: formatDayHoursLabel(schedule[day]),
  }));
}

export function formatOpeningHoursForDisplay(raw: string | null | undefined) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return "";

  if (trimmed.startsWith("{")) {
    const schedule = parseWeeklySchedule(trimmed);
    return formatWeeklyScheduleLines(schedule)
      .map((row) => `${row.label} ${row.hours}`)
      .join(" · ");
  }

  return trimmed;
}

const NZ_TIME_ZONE = "Pacific/Auckland";

function previousWeekday(day: Weekday): Weekday {
  const index = WEEKDAYS.indexOf(day);
  return WEEKDAYS[(index + 6) % 7];
}

function timeToMinutes(value: string) {
  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw) === 24 ? 0 : Number(hourRaw);
  return hour * 60 + Number(minuteRaw);
}

function getNzLocalTimeParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-NZ", {
    timeZone: NZ_TIME_ZONE,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value])
  );
  const weekday = (parts.weekday ?? "Monday").toLowerCase() as Weekday;
  const hour = Number(parts.hour) === 24 ? 0 : Number(parts.hour);
  const minute = Number(parts.minute);
  return {
    weekday: WEEKDAYS.includes(weekday) ? weekday : "monday",
    minutes: hour * 60 + minute,
  };
}

function isHoursOpenAt(hours: DayHours, minutes: number) {
  if (!hours.isOpen) return false;
  if (hours.is24Hours) return true;
  const open = timeToMinutes(hours.openTime);
  const close = timeToMinutes(hours.closeTime);
  if (close <= open) {
    return minutes >= open;
  }
  return minutes >= open && minutes < close;
}

export function isVenueOpenNow(schedule: WeeklySchedule, now = new Date()) {
  const { weekday, minutes } = getNzLocalTimeParts(now);
  if (isHoursOpenAt(schedule[weekday], minutes)) return true;

  const yesterday = schedule[previousWeekday(weekday)];
  if (!yesterday.isOpen || yesterday.is24Hours) return false;
  const open = timeToMinutes(yesterday.openTime);
  const close = timeToMinutes(yesterday.closeTime);
  return close < open && minutes < close;
}

export function getVenueOpenState(
  raw: string | null | undefined,
  now = new Date()
): "open" | "closed" | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed.startsWith("{")) return null;
  return isVenueOpenNow(parseWeeklySchedule(trimmed), now) ? "open" : "closed";
}
