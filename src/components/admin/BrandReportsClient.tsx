"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { StatCard, StatusBadge, formatAdminDate } from "@/components/admin/AdminUi";
import {
  dismissBrandReportAction,
  getBrandReportAttachmentUrlAction,
  loadBrandReportEventsAction,
  requestBrandReportInfoAction,
  resolveBrandReportAction,
  updateBrandReportAction,
} from "@/lib/admin/actions";
import type {
  AdminUserOption,
  BrandReportEventRow,
  BrandReportRow,
  BrandReportStats,
} from "@/lib/admin/types";
import {
  BRAND_REPORT_PRIORITIES,
  BRAND_REPORT_STATUSES,
  brandReportReasonLabel,
} from "@/lib/brand-reports/constants";

type BrandReportsClientProps = {
  stats: BrandReportStats;
  reports: BrandReportRow[];
  total: number;
  admins: AdminUserOption[];
  initialSearch: string;
  initialStatus: string;
  initialPriority: string;
  initialBrandId: string;
  initialSort: string;
  initialPage: number;
  pageSize: number;
};

function priorityClass(priority: string) {
  if (priority === "Critical") return "text-red-700 bg-red-50";
  if (priority === "High") return "text-orange-700 bg-orange-50";
  if (priority === "Medium") return "text-amber-700 bg-amber-50";
  return "text-slate-600 bg-slate-100";
}

export function BrandReportsClient({
  stats,
  reports,
  total,
  admins,
  initialSearch,
  initialStatus,
  initialPriority,
  initialBrandId,
  initialSort,
  initialPage,
  pageSize,
}: BrandReportsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState(initialPriority);
  const [brandId, setBrandId] = useState(initialBrandId);
  const [sort, setSort] = useState(initialSort);
  const [selected, setSelected] = useState<BrandReportRow | null>(null);
  const [events, setEvents] = useState<BrandReportEventRow[]>([]);
  const [assignedAdminId, setAssignedAdminId] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [reportPriority, setReportPriority] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [timelineNote, setTimelineNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const brandOptions = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach((row) => {
      if (row.brand_id && row.brand_name) {
        map.set(row.brand_id, row.brand_name);
      }
    });
    return Array.from(map.entries());
  }, [reports]);

  function pushFilters(nextPage = initialPage) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (brandId) params.set("brand", brandId);
    if (sort) params.set("sort", sort);
    if (nextPage > 1) params.set("page", String(nextPage));
    router.push(`/admin/reports${params.toString() ? `?${params}` : ""}`);
  }

  function openDetail(report: BrandReportRow) {
    setSelected(report);
    setAssignedAdminId(report.assigned_admin_id ?? "");
    setReportStatus(report.status);
    setReportPriority(report.priority);
    setAdminNotes(report.admin_notes ?? "");
    setTimelineNote("");
    setError(null);
    startTransition(async () => {
      const result = await loadBrandReportEventsAction(report.id);
      if ("error" in result && result.error) {
        setError(result.error);
        setEvents([]);
        return;
      }
      setEvents(result.events ?? []);
    });
  }

  function runAction(action: () => Promise<{ error?: string; success?: boolean }>) {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      setSelected(null);
      router.refresh();
    });
  }

  async function downloadAttachment(path: string) {
    const result = await getBrandReportAttachmentUrlAction(path);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if ("url" in result && result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted">
          Review member-submitted brand profile reports
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New" value={stats.newCount} />
        <StatCard label="Under Review" value={stats.underReviewCount} />
        <StatCard label="Resolved" value={stats.resolvedCount} />
        <StatCard label="Critical" value={stats.criticalCount} />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reference, brand, reporter, reason..."
          className="rounded border border-border px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded border border-border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {BRAND_REPORT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="rounded border border-border px-3 py-2 text-sm"
        >
          <option value="">All priorities</option>
          {BRAND_REPORT_PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={brandId}
          onChange={(event) => setBrandId(event.target.value)}
          className="rounded border border-border px-3 py-2 text-sm"
        >
          <option value="">All brands</option>
          {brandOptions.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded border border-border px-3 py-2 text-sm"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => pushFilters(1)}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatus("");
            setPriority("");
            setBrandId("");
            setSort("newest");
            router.push("/admin/reports");
          }}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface"
        >
          Reset
        </button>
      </div>

      <div className="flex gap-6">
        <div className={`min-w-0 flex-1 ${selected ? "lg:max-w-[calc(100%-420px)]" : ""}`}>
          <div className="overflow-hidden rounded border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Date
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted md:table-cell">
                    Brand
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted lg:table-cell">
                    Reported By
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted xl:table-cell">
                    Assigned To
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => openDetail(report)}
                      className={`cursor-pointer border-b border-border last:border-0 hover:bg-surface ${
                        selected?.id === report.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {report.report_reference}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {formatAdminDate(report.created_at)}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {report.brand_name ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-muted lg:table-cell">
                        {report.reporter_email ?? "Member"}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {brandReportReasonLabel(report.reason)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityClass(report.priority)}`}
                        >
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge label={report.status} />
                      </td>
                      <td className="hidden px-4 py-3 text-muted xl:table-cell">
                        {report.assigned_admin_name ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>
              Page {initialPage} of {totalPages} · {total} reports
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={initialPage <= 1}
                onClick={() => pushFilters(initialPage - 1)}
                className="rounded border border-border px-3 py-1.5 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={initialPage >= totalPages}
                onClick={() => pushFilters(initialPage + 1)}
                className="rounded border border-border px-3 py-1.5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {selected ? (
          <aside className="w-full shrink-0 rounded border border-border bg-white lg:w-[400px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                {selected.report_reference}
              </h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-muted hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto px-5 py-4">
              <div className="flex items-center gap-3">
                {selected.brand_logo_url ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                    <Image
                      src={selected.brand_logo_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-xs font-bold text-primary">
                    {(selected.brand_name ?? "?").charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {selected.brand_name ?? "Unknown brand"}
                  </p>
                  <p className="text-xs text-muted">
                    Submitted {formatAdminDate(selected.created_at)}
                  </p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Reporter
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {selected.reporter_email ?? "Member account"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Reason
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {brandReportReasonLabel(selected.reason)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Description
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-foreground">
                    {selected.description}
                  </dd>
                </div>
              </dl>

              {selected.attachment_urls.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Attachments
                  </p>
                  <ul className="mt-2 space-y-2">
                    {selected.attachment_urls.map((path) => (
                      <li key={path}>
                        <button
                          type="button"
                          onClick={() => void downloadAttachment(path)}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Download {path.split("/").pop()}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid gap-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Priority
                  <select
                    value={reportPriority}
                    onChange={(event) => setReportPriority(event.target.value)}
                    className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  >
                    {BRAND_REPORT_PRIORITIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Status
                  <select
                    value={reportStatus}
                    onChange={(event) => setReportStatus(event.target.value)}
                    className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  >
                    {BRAND_REPORT_STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Assigned To
                  <select
                    value={assignedAdminId}
                    onChange={(event) => setAssignedAdminId(event.target.value)}
                    className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Internal Notes
                  <textarea
                    value={adminNotes}
                    onChange={(event) => setAdminNotes(event.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Add timeline note
                  <textarea
                    value={timelineNote}
                    onChange={(event) => setTimelineNote(event.target.value)}
                    rows={2}
                    placeholder="Optional note for the timeline"
                    className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  />
                </label>
              </div>

              {error ? (
                <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    runAction(() =>
                      updateBrandReportAction(selected.id, {
                        status: reportStatus,
                        priority: reportPriority,
                        assigned_admin_id: assignedAdminId || null,
                        admin_notes: adminNotes,
                        note: timelineNote || undefined,
                      })
                    )
                  }
                  className="fv-btn-primary rounded-sm px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  disabled={pending || !selected.contact_permission}
                  onClick={() =>
                    runAction(() =>
                      requestBrandReportInfoAction(
                        selected.id,
                        timelineNote || "Additional information requested from reporter"
                      )
                    )
                  }
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface disabled:opacity-50"
                >
                  Request info
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    runAction(() =>
                      resolveBrandReportAction(selected.id, timelineNote || undefined)
                    )
                  }
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
                >
                  Resolve
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    runAction(() =>
                      dismissBrandReportAction(selected.id, timelineNote || undefined)
                    )
                  }
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface"
                >
                  Dismiss
                </button>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Timeline
                </h3>
                <ul className="mt-3 space-y-3">
                  {events.map((event) => (
                    <li key={event.id} className="border-l-2 border-border pl-3">
                      <p className="text-sm font-medium text-foreground">
                        {event.description}
                      </p>
                      <p className="text-xs text-muted">
                        {formatAdminDate(event.created_at)}
                        {event.admin_name ? ` · ${event.admin_name}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
