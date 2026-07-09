"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatCard, StatusBadge, formatAdminDate } from "@/components/admin/AdminUi";
import type { MemberRow } from "@/lib/admin/types";

type Stats = {
  totalMembers: number;
  activeTrial: number;
  newThisMonth: number;
  churnRate: number;
};

export function MembersClient({
  members,
  stats,
  initialSearch,
}: {
  members: MemberRow[];
  stats: Stats;
  initialSearch: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`/admin/members${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Members</h1>
        <p className="mt-1 text-sm text-muted">Membership directory and subscription status</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={stats.totalMembers.toLocaleString()} />
        <StatCard label="Active Trials" value={stats.activeTrial.toLocaleString()} />
        <StatCard label="New This Month" value={stats.newThisMonth.toLocaleString()} />
        <StatCard label="Churn Rate" value={`${stats.churnRate}%`} />
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="max-w-md flex-1 rounded border border-border px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted">
                  No members found
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-4 py-3 font-medium text-foreground">{member.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{member.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={member.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">{formatAdminDate(member.joined_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
