import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminUser } from "@/lib/admin/auth";

export default async function AdminPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminUser();
  return <AdminShell>{children}</AdminShell>;
}
