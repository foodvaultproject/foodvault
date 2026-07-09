import type { CommissionStatus } from "@/lib/store-integration/types";

const STATUS_STYLES: Record<CommissionStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-success-light text-success",
  paid: "bg-primary/10 text-primary",
  cancelled: "bg-surface text-muted-foreground",
  refunded: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function CommissionStatusBadge({ status }: { status: CommissionStatus | null | undefined }) {
  if (!status) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
