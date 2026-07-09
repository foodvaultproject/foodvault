"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatAdminDate } from "@/components/admin/AdminUi";
import { saveSystemSettingsAction } from "@/lib/admin/actions";
import type { SystemSettings } from "@/lib/admin/types";
import {
  DEFAULT_MEMBERSHIP_PRICE_MONTHLY,
  DEFAULT_TRIAL_LENGTH_DAYS,
} from "@/lib/system-settings";

type AuditLog = { action: string; created_at: string };

const inputClass =
  "w-full rounded-md border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

function numberInputDefault(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function SettingsForm({
  settings,
  auditLogs,
}: {
  settings: SystemSettings;
  auditLogs: AuditLog[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveSystemSettingsAction(fd);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Settings saved successfully.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="mt-1 text-sm text-muted">Platform configuration and operational defaults</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 rounded border border-border bg-white p-6">
        <div>
          <label className={labelClass} htmlFor="platform_name">Platform Name</label>
          <input
            id="platform_name"
            name="platform_name"
            required
            defaultValue={settings.platform_name}
            className={inputClass}
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="membership_price_monthly">
              Membership Price (NZD / month)
            </label>
            <input
              id="membership_price_monthly"
              name="membership_price_monthly"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              required
              defaultValue={numberInputDefault(
                settings.membership_price_monthly,
                DEFAULT_MEMBERSHIP_PRICE_MONTHLY
              )}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="trial_length_days">Trial Length (days)</label>
            <input
              id="trial_length_days"
              name="trial_length_days"
              type="number"
              min={0}
              required
              defaultValue={numberInputDefault(
                settings.trial_length_days,
                DEFAULT_TRIAL_LENGTH_DAYS
              )}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="support_email">Support Email</label>
          <input
            id="support_email"
            name="support_email"
            type="email"
            required
            defaultValue={settings.support_email}
            className={inputClass}
          />
        </div>

        {message ? (
          <p className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
        >
          Save Settings
        </button>
      </form>

      <section className="max-w-2xl rounded border border-border bg-page p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Audit Trail</h2>
        <p className="mt-1 text-xs text-muted">
          All changes to system settings are logged for compliance and review.
        </p>
        <ul className="mt-4 space-y-3">
          {auditLogs.length === 0 ? (
            <li className="text-sm text-muted">No recent audit entries.</li>
          ) : (
            auditLogs.map((log, i) => (
              <li key={i} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-foreground">{log.action}</span>
                <span className="shrink-0 text-xs text-muted">{formatAdminDate(log.created_at)}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
