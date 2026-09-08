import { requireAdminUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function PackingSlipLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminUser();
  return children;
}
