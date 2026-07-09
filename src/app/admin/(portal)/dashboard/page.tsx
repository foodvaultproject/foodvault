import Link from "next/link";
import { StatCard, StatusBadge, formatAdminDate } from "@/components/admin/AdminUi";
import {
  getDashboardStats,
  getPendingApplications,
  getRecentEnquiries,
  getRecentMembers,
} from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const [stats, applications, members, enquiries] = await Promise.all([
    getDashboardStats(),
    getPendingApplications(),
    getRecentMembers(),
    getRecentEnquiries(),
  ]);

  const pendingQueue = applications.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Platform overview and operational queues</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active Members" value={stats.activeMembers.toLocaleString()} />
        <StatCard label="Paid Members" value={stats.paidMembers.toLocaleString()} />
        <StatCard label="Live Partners" value={stats.livePartners.toLocaleString()} />
        <StatCard label="Pending Applications" value={stats.pendingApplications} />
        <StatCard label="Support Enquiries" value={stats.supportEnquiries} />
        <StatCard label="Published Articles" value={stats.publishedArticles.toLocaleString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Applications Queue
            </h2>
            <Link href="/admin/partner-applications" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {pendingQueue.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted">No pending applications</li>
            ) : (
              pendingQueue.map((app) => (
                <li key={app.id} className="px-5 py-3 hover:bg-surface">
                  <p className="text-sm font-semibold text-foreground">{app.business_name ?? "Unnamed"}</p>
                  <p className="text-xs text-muted">{app.primary_category ?? "—"} · {app.location ?? "—"}</p>
                  <p className="mt-1 text-xs text-[#94a3b8]">{formatAdminDate(app.created_at)}</p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Recent Members</h2>
            <Link href="/admin/members" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface">
                <div>
                  <p className="text-sm font-semibold text-foreground">{member.full_name ?? member.email}</p>
                  <p className="text-xs text-muted">{formatAdminDate(member.joined_at)}</p>
                </div>
                <StatusBadge label={member.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Contact Enquiries</h2>
            <Link href="/admin/contact" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {enquiries.map((enquiry) => (
              <li key={enquiry.id} className="px-5 py-3 hover:bg-surface">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{enquiry.subject}</p>
                  <StatusBadge label={enquiry.status} />
                </div>
                <p className="text-xs text-muted">
                  {enquiry.name} · {enquiry.enquiry_type}
                </p>
                <p className="mt-1 text-xs text-[#94a3b8]">{formatAdminDate(enquiry.created_at)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
