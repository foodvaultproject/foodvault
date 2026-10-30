import Link from "next/link";
import { notFound } from "next/navigation";
import { formatAdminDate, StatusBadge } from "@/components/admin/AdminUi";
import { updateStockUpCustomerAction } from "@/lib/admin/stockup-customer-actions";
import { getStockUpCustomer } from "@/lib/admin/stockup-customers";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

function money(value: number) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(value);
}

export default async function StockUpCustomerPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const customer = await getStockUpCustomer(id);
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/customers" className="text-sm font-semibold text-primary hover:underline">
          Back to customers
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{customer.fullName}</h1>
        <p className="mt-1 text-sm text-muted">{customer.email}</p>
      </div>

      {query.saved ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Account details saved.
        </p>
      ) : null}
      {query.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error === "name"
            ? "Enter a first and last name to save this account."
            : "The account could not be saved."}
        </p>
      ) : null}

      <section className="rounded border border-border bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Account</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Joined</dt>
            <dd className="font-semibold text-foreground">
              {customer.createdAt ? formatAdminDate(customer.createdAt) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Email confirmed</dt>
            <dd className="font-semibold text-foreground">{customer.emailConfirmed ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-muted">Orders</dt>
            <dd className="font-semibold text-foreground">{customer.orderCount}</dd>
          </div>
          <div>
            <dt className="text-muted">Total spent</dt>
            <dd className="font-semibold text-foreground">{money(customer.orderTotal)}</dd>
          </div>
        </dl>

        <form action={updateStockUpCustomerAction} className="mt-6 grid gap-4 sm:grid-cols-3">
          <input type="hidden" name="id" value={customer.id} />
          <label className="text-sm">
            <span className="font-semibold text-foreground">First name</span>
            <input
              name="firstName"
              defaultValue={customer.firstName}
              required
              className="mt-1 w-full rounded border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-foreground">Last name</span>
            <input
              name="lastName"
              defaultValue={customer.lastName}
              required
              className="mt-1 w-full rounded border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-foreground">Country</span>
            <input
              name="country"
              defaultValue={customer.country}
              className="mt-1 w-full rounded border border-border px-3 py-2"
            />
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Save account
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-x-auto rounded border border-border bg-white">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Order history</h2>
        </div>
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Order</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Total</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  No orders yet
                </td>
              </tr>
            ) : (
              customer.orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/admin/picker/${order.id}`} className="hover:text-primary">
                      {order.shortId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatAdminDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={order.displayStatus} />
                  </td>
                  <td className="px-4 py-3">{money(order.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
