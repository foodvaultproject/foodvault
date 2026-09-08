"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, logAuditAction } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function fulfillPickerOrderAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };

  const orderId = String(formData.get("order_id") ?? "").trim();
  const trackingNumber = String(formData.get("tracking_number") ?? "").trim();
  if (!orderId) return { error: "Order is required." };

  const supabase = createAdminClient() ?? (await createClient());
  const payload: Record<string, unknown> = {
    status: "fulfilled",
    tracking_number: trackingNumber || null,
    fulfilled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const attempt = async (body: Record<string, unknown>) =>
    supabase
      .from("foodvault_orders")
      .update(body)
      .eq("id", orderId)
      .eq("status", "paid")
      .select("id")
      .maybeSingle();

  let body = { ...payload };
  let { data, error } = await attempt(body);
  for (let i = 0; i < 4 && error; i += 1) {
    const column =
      error.message.match(/Could not find the '([^']+)' column/i)?.[1] ??
      error.message.match(/column "([^"]+)"/i)?.[1];
    if (!column || !(column in body)) break;
    const next = { ...body };
    delete next[column];
    body = next;
    ({ data, error } = await attempt(body));
  }

  if (error) return { error: error.message };
  if (!data) {
    const { data: existing } = await supabase
      .from("foodvault_orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();
    if (existing && (existing as { status?: string }).status === "fulfilled") {
      return { success: true };
    }
    return { error: "Order is not ready to fulfill." };
  }

  await logAuditAction("fulfill_vault_market_order", "foodvault_order", orderId, {
    trackingNumber: trackingNumber || null,
  });
  revalidatePath("/admin/picker");
  revalidatePath(`/admin/picker/${orderId}`);
  return { success: true };
}
