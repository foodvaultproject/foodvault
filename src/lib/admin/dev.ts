import { cookies } from "next/headers";
import type { AdminUser } from "@/lib/admin/types";

const DEV_ADMIN_COOKIE = "foodvault-dev-admin";

export const DEV_ADMIN_EMAIL = "admin@foodvault.io";

export type DevAdminSession = {
  email: string;
  full_name: string;
  role: string;
};

export function readDevAdminUser(): AdminUser | null {
  return {
    id: "dev-admin",
    auth_user_id: "dev-admin",
    email: DEV_ADMIN_EMAIL,
    full_name: "System Administrator",
    role: "Super Administrator",
  };
}

export async function getDevAdminFromCookie(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  if (cookieStore.get(DEV_ADMIN_COOKIE)?.value === "1") {
    return readDevAdminUser();
  }
  return null;
}

export async function setDevAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(DEV_ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearDevAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_ADMIN_COOKIE);
}
