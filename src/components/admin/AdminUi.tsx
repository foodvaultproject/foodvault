const styles: Record<string, string> = {
  Live: "bg-emerald-50 text-emerald-700",
  "Pending Activation": "bg-orange-50 text-orange-700",
  "Under Review": "bg-blue-50 text-blue-700",
  Suspended: "bg-red-50 text-red-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  TRIAL: "bg-blue-50 text-blue-700",
  EXPIRED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-slate-100 text-slate-600",
  NEW: "bg-orange-50 text-orange-700",
  OPEN: "bg-blue-50 text-blue-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-slate-100 text-slate-700",
  ARCHIVED: "bg-slate-200 text-slate-700",
  MEMBER: "bg-blue-50 text-blue-700",
  PARTNER: "bg-purple-50 text-purple-700",
  GENERAL: "bg-slate-100 text-slate-700",
};

export function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[label] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded border border-border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
