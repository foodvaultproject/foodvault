"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAdminDate } from "@/components/admin/AdminUi";
import type { StockUpCustomerSummary } from "@/lib/admin/stockup-customers";

function money(value: number) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(value);
}

export function StockUpCustomersClient({
  customers,
  initialSearch,
  warning,
}: {
  customers: StockUpCustomerSummary[];
  initialSearch: string;
  warning: string | null;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`/admin/customers${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="mt-1 text-sm text-muted">People who created a StockUp account</p>
      </div>

      {warning ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{warning}</p>
      ) : null}

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email..."
          className="max-w-md flex-1 rounded border border-border px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Orders</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Spent</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  No StockUp customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    <Link href={`/admin/customers/${customer.id}`} className="hover:text-primary">
                      {customer.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{customer.email}</td>
                  <td className="px-4 py-3">{customer.orderCount}</td>
                  <td className="px-4 py-3">{money(customer.orderTotal)}</td>
                  <td className="px-4 py-3 text-muted">
                      {customer.createdAt ? formatAdminDate(customer.createdAt) : "—"}
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
