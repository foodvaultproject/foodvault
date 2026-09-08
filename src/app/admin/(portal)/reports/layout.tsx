import { ReportsSuiteNav } from "@/components/admin/reports/ReportsSuiteNav";

export default function AdminReportsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="space-y-6">
      <ReportsSuiteNav />
      {children}
    </div>
  );
}
