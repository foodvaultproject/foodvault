"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/auth";
import { ADMIN_DASHBOARD_PATH } from "@/lib/admin/types";
import { ADMIN_WORKSPACE_COOKIE } from "@/lib/admin/workspace";
import type { AdminWorkspace } from "@/lib/admin/workspace-paths";

export async function selectAdminWorkspace(workspace: AdminWorkspace) {
  await requireAdminUser();

  const jar = await cookies();
  jar.set(ADMIN_WORKSPACE_COOKIE, workspace, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(ADMIN_DASHBOARD_PATH);
}

export async function openFoodVaultAdmin() {
  await selectAdminWorkspace("foodvault");
}

export async function openStockUpAdmin() {
  await selectAdminWorkspace("stockup");
}
