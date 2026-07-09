import type { DashboardInsight, InAppNotification } from "@/lib/notification-service/types";

export function mapInAppNotifications(data: unknown): InAppNotification[] {
  if (!data) return [];

  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    readAt: (row.read_at as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
  }));
}

export function mapDashboardInsights(data: unknown): DashboardInsight[] {
  if (!data) return [];

  return (data as Record<string, unknown>[])
    .map((row) => ({
      type: String(row.type ?? ""),
      title: String(row.title ?? ""),
      body: String(row.body ?? ""),
      priority: Number(row.priority ?? 99),
    }))
    .sort((a, b) => a.priority - b.priority);
}
