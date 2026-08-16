"use client";

import {
  copyMondayHoursToOpenDays,
  parseWeeklySchedule,
  serializeWeeklySchedule,
  WEEKDAY_LABELS,
  WEEKDAYS,
  type DayHours,
  type Weekday,
  type WeeklySchedule,
} from "@/lib/hospitality/hours";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "text-sm font-bold text-foreground";

type WeeklyHoursEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function WeeklyHoursEditor({
  value,
  onChange,
  disabled = false,
}: WeeklyHoursEditorProps) {
  const schedule = parseWeeklySchedule(value);

  function commit(next: WeeklySchedule) {
    onChange(serializeWeeklySchedule(next));
  }

  function patchDay(day: Weekday, partial: Partial<DayHours>) {
    commit({
      ...schedule,
      [day]: { ...schedule[day], ...partial },
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className={labelClass}>
          Opening Hours <span className="text-primary">*</span>
        </label>
        <button
          type="button"
          disabled={
            disabled || !WEEKDAYS.some((day) => day !== "monday" && schedule[day].isOpen)
          }
          onClick={() => commit(copyMondayHoursToOpenDays(schedule))}
          className="text-xs font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          Copy Monday hours to all open days
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Set when members can visit. At least one open day is required.
      </p>

      <div className="mt-3 divide-y divide-border overflow-hidden rounded-md border border-border">
        {WEEKDAYS.map((day) => {
          const hours = schedule[day];
          const timesDisabled = disabled || !hours.isOpen || hours.is24Hours;

          return (
            <div
              key={day}
              className="grid gap-3 bg-background px-3 py-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center"
            >
              <p className="text-sm font-semibold text-foreground">
                {WEEKDAY_LABELS[day]}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={hours.isOpen}
                  aria-label={`${WEEKDAY_LABELS[day]} ${hours.isOpen ? "open" : "closed"}`}
                  disabled={disabled}
                  onClick={() =>
                    patchDay(day, {
                      isOpen: !hours.isOpen,
                      is24Hours: hours.isOpen ? false : hours.is24Hours,
                    })
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                    hours.isOpen ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
                      hours.isOpen ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                {hours.isOpen ? (
                  <>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={hours.is24Hours}
                        onChange={(event) =>
                          patchDay(day, { is24Hours: event.target.checked })
                        }
                        className="rounded border-border text-primary focus:ring-primary/20"
                      />
                      24 hours
                    </label>
                    {hours.is24Hours ? (
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        Open 24 hours
                      </span>
                    ) : (
                      <>
                        <input
                          type="time"
                          aria-label={`${WEEKDAY_LABELS[day]} opening time`}
                          disabled={timesDisabled}
                          value={hours.openTime}
                          onChange={(event) =>
                            patchDay(day, { openTime: event.target.value })
                          }
                          className={`w-[7.5rem] ${inputClass} disabled:bg-surface disabled:text-muted-foreground`}
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <input
                          type="time"
                          aria-label={`${WEEKDAY_LABELS[day]} closing time`}
                          disabled={timesDisabled}
                          value={hours.closeTime}
                          onChange={(event) =>
                            patchDay(day, { closeTime: event.target.value })
                          }
                          className={`w-[7.5rem] ${inputClass} disabled:bg-surface disabled:text-muted-foreground`}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <span className="inline-flex rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    Closed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
