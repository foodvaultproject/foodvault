import { getMemberVaultMarketOrders, type MemberOrderHistoryItem } from "@/lib/commerce/member-orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";

export type StockUpCustomerSummary = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  country: string;
  createdAt: string | null;
  emailConfirmed: boolean;
  orderCount: number;
  orderTotal: number;
  lastOrderAt: string | null;
};

export type StockUpCustomerDetail = StockUpCustomerSummary & {
  marketingOptIn: boolean;
  orders: MemberOrderHistoryItem[];
  canEdit: boolean;
};

type OrderRollup = {
  count: number;
  total: number;
  lastOrderAt: string | null;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function matchesSearch(customer: { email: string; fullName: string }, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return (
    customer.email.toLowerCase().includes(query) ||
    customer.fullName.toLowerCase().includes(query)
  );
}

async function orderRollups(memberIds: string[]): Promise<Map<string, OrderRollup>> {
  const rollups = new Map<string, OrderRollup>();
  if (memberIds.length === 0) return rollups;

  const admin = createAdminClient();
  const supabase = admin ?? (isSupabaseConfigured() ? await createClient() : null);
  if (!supabase) return rollups;

  const { data, error } = await supabase
    .from("foodvault_orders")
    .select("member_id, total, created_at, status")
    .in("member_id", memberIds);

  if (error || !data) return rollups;

  for (const row of data) {
    const memberId = text(row.member_id);
    if (!memberId) continue;
    if (row.status === "cancelled") continue;
    const current = rollups.get(memberId) ?? { count: 0, total: 0, lastOrderAt: null };
    const createdAt = text(row.created_at);
    current.count += 1;
    current.total += Number(row.total) || 0;
    if (createdAt && (!current.lastOrderAt || createdAt > current.lastOrderAt)) {
      current.lastOrderAt = createdAt;
    }
    rollups.set(memberId, current);
  }

  return rollups;
}

function fromMetadata(user: {
  id: string;
  email?: string | null;
  created_at?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): StockUpCustomerSummary | null {
  const metadata = user.user_metadata ?? {};
  if (metadata.signup_mode !== "stockup") return null;
  const firstName = text(metadata.first_name);
  const lastName = text(metadata.last_name);
  const fullName = `${firstName} ${lastName}`.trim() || text(metadata.full_name) || "StockUp customer";
  return {
    id: user.id,
    email: user.email ?? "",
    firstName,
    lastName,
    fullName,
    country: text(metadata.country) || "New Zealand",
    createdAt: user.created_at ?? null,
    emailConfirmed: Boolean(user.email_confirmed_at),
    orderCount: 0,
    orderTotal: 0,
    lastOrderAt: null,
  };
}

export async function listStockUpCustomers(search = ""): Promise<{
  customers: StockUpCustomerSummary[];
  warning: string | null;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      customers: [],
      warning:
        "StockUp customer accounts cannot be listed until the admin service role is configured on this server.",
    };
  }

  const customers: StockUpCustomerSummary[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) break;
    for (const user of data.users) {
      const customer = fromMetadata(user);
      if (customer && matchesSearch(customer, search)) customers.push(customer);
    }
    if (data.users.length < 200) break;
  }

  customers.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  const rollups = await orderRollups(customers.map((customer) => customer.id));
  for (const customer of customers) {
    const rollup = rollups.get(customer.id);
    if (!rollup) continue;
    customer.orderCount = rollup.count;
    customer.orderTotal = rollup.total;
    customer.lastOrderAt = rollup.lastOrderAt;
  }

  return { customers, warning: null };
}

export async function getStockUpCustomer(id: string): Promise<StockUpCustomerDetail | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.auth.admin.getUserById(id);
  if (error || !data.user) return null;
  const summary = fromMetadata(data.user);
  if (!summary) return null;

  const [rollups, orders] = await Promise.all([
    orderRollups([summary.id]),
    getMemberVaultMarketOrders(summary.id),
  ]);
  const rollup = rollups.get(summary.id);
  const metadata = data.user.user_metadata ?? {};

  return {
    ...summary,
    orderCount: rollup?.count ?? orders.length,
    orderTotal: rollup?.total ?? orders.reduce((sum, order) => sum + order.total, 0),
    lastOrderAt: rollup?.lastOrderAt ?? orders[0]?.createdAt ?? null,
    marketingOptIn: metadata.marketing_opt_in === true,
    orders,
    canEdit: true,
  };
}
