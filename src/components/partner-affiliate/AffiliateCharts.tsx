import {
  portalCard,
  portalCardTitle,
  portalHelper,
} from "@/lib/partner-portal-classes";

type BarChartItem = {
  label: string;
  value: number;
};

type SimpleBarChartProps = {
  title: string;
  items: BarChartItem[];
  emptyMessage?: string;
};

export function SimpleBarChart({
  title,
  items,
  emptyMessage = "No data yet.",
}: SimpleBarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={portalCard}>
      <h3 className={portalCardTitle}>{title}</h3>
      {items.length === 0 ? (
        <p className={`${portalHelper} mt-3`}>{emptyMessage}</p>
      ) : (
        <div className="mt-4 flex items-end gap-2 overflow-x-auto pb-2">
          {items.map((item) => (
            <div key={item.label} className="flex min-w-[44px] flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end justify-center">
                <div
                  className="w-full max-w-[48px] rounded-t-lg bg-primary/80 transition-all"
                  style={{ height: `${Math.max((item.value / max) * 100, 4)}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {item.label.slice(5)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type BreakdownListProps = {
  title: string;
  items: { label: string; value: number }[];
  total: number;
};

export function BreakdownList({ title, items, total }: BreakdownListProps) {
  return (
    <div className={portalCard}>
      <h3 className={portalCardTitle}>{title}</h3>
      {items.length === 0 ? (
        <p className={`${portalHelper} mt-3`}>No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-foreground">{item.label}</span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">
                  {item.value}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
