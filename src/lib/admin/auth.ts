"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  clearDevAdminCookie,
  getDevAdminFromCookie,
  readDevAdminUser,
  setDevAdminCookie,
  DEV_ADMIN_EMAIL,
} from "@/lib/admin/dev";
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_LOGIN_PATH,
  type AdminUser,
} from "@/lib/admin/types";

export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) {
    return getDevAdminFromCookie();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, auth_user_id, email, full_name, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminUser;
}

export async function requireAdminUser(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    redirect(ADMIN_LOGIN_PATH);
  }
  return admin;
}

export async function redirectIfAdminAuthenticated() {
  const admin = await getAdminUser();
  if (admin) {
    redirect(ADMIN_DASHBOARD_PATH);
  }
}

export async function adminLoginAction(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    if (email === DEV_ADMIN_EMAIL && password.length >= 1) {
      await setDevAdminCookie();
      return { success: true as const };
    }
    return { error: "Invalid admin credentials." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const adminResponse = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  const { data: adminRow, error: adminError } = adminResponse;

  // TEMP DEBUG — remove after investigating admin login rejection
  console.log("[adminLoginAction] pre-access-check", {
    authUserId: data.user.id,
    adminRow,
    adminError,
    completeSupabaseResponse: {
      data: adminResponse.data,
      error: adminResponse.error,
      status: adminResponse.status,
      statusText: adminResponse.statusText,
      count: adminResponse.count,
    },
  });

  if (adminError || !adminRow) {
    await supabase.auth.signOut();
    return { error: "You do not have access to FoodVault OS." };
  }

  return { success: true as const };
}

export async function adminLogoutAction() {
  if (!isSupabaseConfigured()) {
    await clearDevAdminCookie();
    redirect(ADMIN_LOGIN_PATH);
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ADMIN_LOGIN_PATH);
}

export async function logAuditAction(
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  const admin = await getAdminUser();
  if (!admin || !isSupabaseConfigured()) return;

  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    admin_user_id: admin.id === "dev-admin" ? null : admin.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}
