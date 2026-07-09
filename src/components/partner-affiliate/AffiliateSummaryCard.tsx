import {
  portalCard,
  portalHelper,
  portalMetricValue,
} from "@/lib/partner-portal-classes";

type SummaryCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function AffiliateSummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <div className={portalCard}>
      <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`${portalMetricValue} mt-1`}>{value}</p>
      {hint ? <p className={`${portalHelper} mt-0.5`}>{hint}</p> : null}
    </div>
  );
}

export function ComingSoonCard({ label }: { label: string }) {
  return <AffiliateSummaryCard label={label} value="Coming Soon" hint="Shopify integration" />;
}
