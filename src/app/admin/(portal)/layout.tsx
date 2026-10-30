import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminUser } from "@/lib/admin/auth";
import { getAdminWorkspace } from "@/lib/admin/workspace";

export default async function AdminPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminUser();
  const workspace = await getAdminWorkspace();
  if (!workspace) redirect("/admin");
  return <AdminShell workspace={workspace}>{children}</AdminShell>;
}
