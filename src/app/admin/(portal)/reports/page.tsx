import { BrandReportsClient } from "@/components/admin/BrandReportsClient";
import {
  getAdminUserOptions,
  getBrandReportStats,
  getBrandReports,
} from "@/lib/admin/queries";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    brand?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function AdminReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? 1) || 1, 1);
  const pageSize = 20;

  const [stats, reportList, admins] = await Promise.all([
    getBrandReportStats(),
    getBrandReports({
      search: params.q,
      status: params.status,
      priority: params.priority,
      brandId: params.brand,
      sort: (params.sort as "newest" | "oldest" | "priority") ?? "newest",
      page,
      pageSize,
    }),
    getAdminUserOptions(),
  ]);

  return (
    <BrandReportsClient
      stats={stats}
      reports={reportList.rows}
      total={reportList.total}
      admins={admins}
      initialSearch={params.q ?? ""}
      initialStatus={params.status ?? ""}
      initialPriority={params.priority ?? ""}
      initialBrandId={params.brand ?? ""}
      initialSort={params.sort ?? "newest"}
      initialPage={page}
      pageSize={pageSize}
    />
  );
}
