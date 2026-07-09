import Link from "next/link";
import { getAdminAffiliateAnalytics } from "@/lib/admin/queries";

export default async function AdminAffiliateLeaderboardsPage() {
  const analytics = await getAdminAffiliateAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Affiliate Leaderboards</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Internal performance rankings for brands and affiliates.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Top Brands</h2>
          <div className="mt-4 space-y-3">
            {analytics.topBrands.slice(0, 10).map((row, index) => (
              <div key={row.id} className="flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground">
                    {index + 1}. {row.businessName}
                  </p>
                  <p className="text-muted-foreground">{row.clicks} clicks</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Top Affiliates</h2>
          <div className="mt-4 space-y-3">
            {analytics.topAffiliates.slice(0, 10).map((row, index) => (
              <div key={row.id} className="flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground">
                    {index + 1}. {row.firstName} {row.lastName}
                  </p>
                  <p className="text-muted-foreground">{row.country}</p>
                </div>
                <p className="font-medium text-foreground">{row.clicks} clicks</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="text-sm text-muted-foreground">
        Need deeper analysis? Visit{" "}
        <Link href="/admin/affiliate-analytics" className="font-semibold text-primary">
          Affiliate Analytics
        </Link>
        .
      </p>
    </div>
  );
}
