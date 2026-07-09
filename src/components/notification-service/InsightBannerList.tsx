import type { DashboardInsight } from "@/lib/notification-service/types";

type InsightBannerListProps = {
  insights: DashboardInsight[];
};

export function InsightBannerList({ insights }: InsightBannerListProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      {insights.slice(0, 2).map((insight) => (
        <div
          key={`${insight.type}-${insight.title}`}
          className="rounded-lg border border-primary/20 bg-primary/5 px-5 py-4"
        >
          <p className="text-sm font-bold text-foreground">{insight.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{insight.body}</p>
        </div>
      ))}
    </div>
  );
}
