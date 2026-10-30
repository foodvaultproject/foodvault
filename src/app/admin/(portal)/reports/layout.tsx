import { ReportsSuiteNav } from "@/components/admin/reports/ReportsSuiteNav";
import { getAdminWorkspace } from "@/lib/admin/workspace";

export default async function AdminReportsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const workspace = (await getAdminWorkspace()) ?? "foodvault";
  return (
    <div className="space-y-6">
      <ReportsSuiteNav workspace={workspace} />
      {children}
    </div>
  );
}
