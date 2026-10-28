import Link from "next/link";
import { StatCard, StatusBadge, formatAdminDate } from "@/components/admin/AdminUi";
import { getAppMode } from "@/lib/app-mode";
import {
  getDashboardStats,
  getPendingApplications,
  getRecentEnquiries,
  getRecentMembers,
} from "@/lib/admin/queries";

const stockupLinks = [
  { href: "/admin/picker", label: "Orders", detail: "Pick, pack, and fulfill supermarket orders." },
  { href: "/admin/products", label: "Products", detail: "Create and edit catalogue items and saver prices." },
  { href: "/admin/inventory", label: "Inventory", detail: "Log batches, unit cost, and what is on hand." },
  { href: "/admin/vendors", label: "Vendors", detail: "Suppliers for the supermarket warehouse." },
  { href: "/admin/purchase-orders", label: "Purchase orders", detail: "Inbound stock orders." },
  { href: "/admin/reports/sales", label: "Store reports", detail: "Sales, inventory, and vendor reports." },
];

export default async function AdminDashboardPage() {
  if (getAppMode() === "stockup") {
    return <StockupAdminDashboard />;
  }

  return <FoodvaultAdminDashboard />;
}

async function StockupAdminDashboard() {
  const enquiries = await getRecentEnquiries();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Supermarket storefront operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stockupLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded border border-border bg-white p-5 transition-colors hover:border-primary"
          >
            <p className="text-sm font-bold text-foreground">{link.label}</p>
            <p className="mt-1 text-sm text-muted">{link.detail}</p>
          </Link>
        ))}
      </div>

      <section className="rounded border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Contact Enquiries</h2>
          <Link href="/admin/contact" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {enquiries.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-muted">No enquiries</li>
          ) : (
            enquiries.map((enquiry) => (
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
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

async function FoodvaultAdminDashboard() {
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
