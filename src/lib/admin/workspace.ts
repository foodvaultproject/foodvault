import { cookies } from "next/headers";
import type { AdminWorkspace } from "@/lib/admin/workspace-paths";

export const ADMIN_WORKSPACE_COOKIE = "admin_workspace";

export async function getAdminWorkspace(): Promise<AdminWorkspace | null> {
  const value = (await cookies()).get(ADMIN_WORKSPACE_COOKIE)?.value;
  if (value === "foodvault" || value === "stockup") return value;
  return null;
}
