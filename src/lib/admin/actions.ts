"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser, logAuditAction } from "@/lib/admin/auth";
import { getBrandReportEvents } from "@/lib/admin/queries";
import { slugifyTitle } from "@/lib/admin/types";
import {
  BRAND_REPORT_PRIORITIES,
  BRAND_REPORT_STATUSES,
  BRAND_REPORT_STORAGE_BUCKET,
} from "@/lib/brand-reports/constants";
import { parseMetaTags } from "@/lib/discover/meta-tags";
import {
  DEFAULT_PLATFORM_NAME,
  DEFAULT_SUPPORT_EMAIL,
} from "@/lib/system-settings";
import {
  updateHomepageSettingsRow,
  updateSystemSettingsRow,
} from "@/lib/system-settings-db";

export async function approvePartnerApplicationAction(partnerId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (!isSupabaseConfigured()) {
    await logAuditAction("approve_partner_application", "partner", partnerId);
    revalidatePath("/admin/partner-applications");
    revalidatePath("/admin/dashboard");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_partner_application", {
    partner_id: partnerId,
  });

  if (error) return { error: error.message };

  await logAuditAction("approve_partner_application", "partner", partnerId);
  revalidatePath("/admin/partner-applications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/partners");
  return { success: true };
}

export async function rejectPartnerApplicationAction(partnerId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (!isSupabaseConfigured()) {
    await logAuditAction("reject_partner_application", "partner", partnerId);
    revalidatePath("/admin/partner-applications");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_partner_application", {
    partner_id: partnerId,
  });

  if (error) return { error: error.message };

  // Rejection email would be sent via Supabase Edge Function or email service.
  await logAuditAction("reject_partner_application", "partner", partnerId, {
    email_sent: true,
  });
  revalidatePath("/admin/partner-applications");
  return { success: true };
}

export async function suspendPartnerAction(partnerId: string, suspended: boolean) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (!isSupabaseConfigured()) {
    revalidatePath("/admin/partners");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("partners")
    .update({ suspended, updated_at: new Date().toISOString() })
    .eq("id", partnerId);

  if (error) return { error: error.message };
  await logAuditAction(suspended ? "suspend_partner" : "restore_partner", "partner", partnerId);
  revalidatePath("/admin/partners");
  return { success: true };
}

export async function deletePartnerAction(partnerId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (!isSupabaseConfigured()) {
    revalidatePath("/admin/partners");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("partners").delete().eq("id", partnerId);
  if (error) return { error: error.message };
  await logAuditAction("delete_partner", "partner", partnerId);
  revalidatePath("/admin/partners");
  return { success: true };
}

export async function updateEnquiryAction(
  id: string,
  data: { status?: string; internal_notes?: string }
) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (!isSupabaseConfigured()) {
    revalidatePath("/admin/contact");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_enquiries")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/contact");
  return { success: true };
}

export async function saveSystemSettingsAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const rawMembershipPrice = Number(formData.get("membership_price_monthly") ?? 0);
  const membershipPrice = Math.round(rawMembershipPrice * 100) / 100;
  const trialLengthDays = Number(formData.get("trial_length_days") ?? 7);

  if (!Number.isFinite(membershipPrice) || membershipPrice < 0) {
    return { error: "Enter a valid membership price." };
  }

  const payload = {
    platform_name:
      String(formData.get("platform_name") ?? "").trim() || DEFAULT_PLATFORM_NAME,
    membership_price_monthly: membershipPrice,
    trial_length_days: trialLengthDays,
    support_email:
      String(formData.get("support_email") ?? "").trim() || DEFAULT_SUPPORT_EMAIL,
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    await logAuditAction("update_system_settings", "system_settings", "1", payload);
    revalidatePath("/admin/settings");
    revalidatePath("/pricing");
    revalidatePath("/signup");
    revalidatePath("/signup/membership");
    revalidatePath("/signup/payment");
    revalidatePath("/membership");
    revalidatePath("/terms");
    revalidatePath("/refund-policy");
    revalidatePath("/faq");
    revalidatePath("/");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await updateSystemSettingsRow(supabase, payload);
  if (error) return { error };

  await logAuditAction("update_system_settings", "system_settings", "1", payload);
  revalidatePath("/admin/settings");
  revalidatePath("/pricing");
  revalidatePath("/signup");
  revalidatePath("/signup/membership");
  revalidatePath("/signup/payment");
  revalidatePath("/membership");
  revalidatePath("/terms");
  revalidatePath("/refund-policy");
  revalidatePath("/faq");
  revalidatePath("/");
  return { success: true };
}

export async function saveHomepageAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const headline = String(formData.get("homepage_headline") ?? "");
  const subheading = String(formData.get("homepage_subheading") ?? "");
  const featuredIds = formData.getAll("featured_partners") as string[];
  const newWeekIds = formData.getAll("new_this_week") as string[];

  if (!isSupabaseConfigured()) {
    revalidatePath("/admin/homepage");
    return { success: true };
  }

  const supabase = await createClient();
  const homepagePayload = {
    homepage_headline: headline,
    homepage_subheading: subheading,
    updated_at: new Date().toISOString(),
  };
  const { error: homepageError } = await updateHomepageSettingsRow(
    supabase,
    homepagePayload
  );
  if (homepageError) return { error: homepageError };

  await supabase.from("homepage_featured").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const featuredRows = featuredIds.slice(0, 6).map((partnerId, index) => ({
    section: "FEATURED_PARTNERS",
    partner_id: partnerId,
    sort_order: index,
  }));
  const newWeekRows = newWeekIds.slice(0, 12).map((partnerId, index) => ({
    section: "NEW_THIS_WEEK",
    partner_id: partnerId,
    sort_order: index,
  }));

  if (featuredRows.length) await supabase.from("homepage_featured").insert(featuredRows);
  if (newWeekRows.length) await supabase.from("homepage_featured").insert(newWeekRows);

  await logAuditAction("update_homepage", "homepage", "1");
  revalidatePath("/admin/homepage");
  return { success: true };
}

export async function saveArticleAction(formData: FormData, publish = false) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const title = String(formData.get("title") ?? "");
  const slug = String(formData.get("slug") ?? slugifyTitle(title));
  const heroImageUrl = formData.get("hero_image_url");
  const payload = {
    title,
    slug,
    category: String(formData.get("category") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    body: String(formData.get("body") ?? ""),
    hero_image_url: heroImageUrl ? String(heroImageUrl) : null,
    meta_title: String(formData.get("meta_title") ?? ""),
    meta_description: String(formData.get("meta_description") ?? ""),
    meta_tags: parseMetaTags(formData.get("meta_tags")),
    featured: formData.get("featured") === "on",
    publish_date: formData.get("publish_date")
      ? String(formData.get("publish_date"))
      : publish
        ? new Date().toISOString()
        : null,
    status: publish ? "PUBLISHED" : "DRAFT",
    author_name: admin.full_name,
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    revalidatePath("/admin/discover");
    revalidatePath("/discover");
    revalidatePath("/");
    return { success: true, id: id ?? "new" };
  }

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("discover_articles").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase.from("discover_articles").insert(payload).select("id").single();
    if (error) return { error: error.message };
    revalidatePath("/admin/discover");
    revalidatePath("/discover");
    revalidatePath("/");
    return { success: true, id: data.id };
  }

  revalidatePath("/admin/discover");
  revalidatePath("/discover");
  revalidatePath("/");
  return { success: true, id };
}

export async function deleteArticleAction(articleId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (!articleId) return { error: "Article ID is required" };

  if (!isSupabaseConfigured()) {
    revalidatePath("/admin/discover");
    revalidatePath("/discover");
    revalidatePath("/");
    return { success: true };
  }

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("discover_articles")
    .select("slug")
    .eq("id", articleId)
    .maybeSingle();

  const { error } = await supabase.from("discover_articles").delete().eq("id", articleId);
  if (error) return { error: error.message };

  await logAuditAction("delete_article", "discover_article", articleId);
  revalidatePath("/admin/discover");
  revalidatePath("/discover");
  revalidatePath("/");
  if (article?.slug) {
    revalidatePath(`/discover/${article.slug}`);
  }
  return { success: true };
}

export async function uploadArticleHeroAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  if (!isSupabaseConfigured()) {
    return { url: URL.createObjectURL ? "" : "/placeholder-hero.jpg" };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("article-images").upload(path, file);
  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("article-images").getPublicUrl(path);

  return { url: publicUrl };
}

async function appendBrandReportEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  reportId: string,
  eventType: string,
  description: string,
  adminUserId: string,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("brand_report_events").insert({
    report_id: reportId,
    event_type: eventType,
    description,
    metadata,
    admin_user_id: adminUserId,
  });
}

export async function updateBrandReportAction(
  reportId: string,
  data: {
    status?: string;
    priority?: string;
    assigned_admin_id?: string | null;
    admin_notes?: string;
    note?: string;
  }
) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (!isSupabaseConfigured()) {
    revalidatePath("/admin/reports");
    return { success: true as const };
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("brand_reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Report not found." };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.status && BRAND_REPORT_STATUSES.includes(data.status as (typeof BRAND_REPORT_STATUSES)[number])) {
    updates.status = data.status;
    if (data.status === "Resolved" || data.status === "Dismissed") {
      updates.reviewed_at = new Date().toISOString();
    }
  }

  if (
    data.priority &&
    BRAND_REPORT_PRIORITIES.includes(data.priority as (typeof BRAND_REPORT_PRIORITIES)[number])
  ) {
    updates.priority = data.priority;
  }

  if ("assigned_admin_id" in data) {
    updates.assigned_admin_id = data.assigned_admin_id;
  }

  if (typeof data.admin_notes === "string") {
    updates.admin_notes = data.admin_notes;
  }

  const { error } = await supabase.from("brand_reports").update(updates).eq("id", reportId);
  if (error) return { error: error.message };

  if (data.status && data.status !== existing.status) {
    await appendBrandReportEvent(
      supabase,
      reportId,
      "status_changed",
      `Status updated to ${data.status}`,
      admin.id,
      { from: existing.status, to: data.status }
    );
  }

  if (data.priority && data.priority !== existing.priority) {
    await appendBrandReportEvent(
      supabase,
      reportId,
      "priority_changed",
      `Priority changed to ${data.priority}`,
      admin.id,
      { from: existing.priority, to: data.priority }
    );
  }

  if ("assigned_admin_id" in data && data.assigned_admin_id !== existing.assigned_admin_id) {
    await appendBrandReportEvent(
      supabase,
      reportId,
      "assigned",
      data.assigned_admin_id ? "Report assigned to administrator" : "Report unassigned",
      admin.id,
      { assigned_admin_id: data.assigned_admin_id }
    );
  }

  if (data.note?.trim()) {
    await appendBrandReportEvent(
      supabase,
      reportId,
      "note_added",
      data.note.trim(),
      admin.id
    );
  }

  if (data.status === "Resolved") {
    await appendBrandReportEvent(supabase, reportId, "resolved", "Report resolved", admin.id);
  }

  if (data.status === "Dismissed") {
    await appendBrandReportEvent(supabase, reportId, "dismissed", "Report dismissed", admin.id);
  }

  if (data.status === "Awaiting Information" && data.status !== existing.status) {
    await appendBrandReportEvent(
      supabase,
      reportId,
      "info_requested",
      "Additional information requested from reporter",
      admin.id
    );
  }

  await logAuditAction("update_brand_report", "brand_report", reportId);
  revalidatePath("/admin/reports");
  return { success: true as const };
}

export async function requestBrandReportInfoAction(reportId: string, note?: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: report } = await supabase
      .from("brand_reports")
      .select("contact_permission")
      .eq("id", reportId)
      .maybeSingle();

    if (!report?.contact_permission) {
      return { error: "Reporter did not grant contact permission." };
    }
  }

  return updateBrandReportAction(reportId, {
    status: "Awaiting Information",
    note: note?.trim() || "Additional information requested from reporter",
  });
}

export async function resolveBrandReportAction(reportId: string, note?: string) {
  return updateBrandReportAction(reportId, {
    status: "Resolved",
    note: note?.trim() || undefined,
  });
}

export async function dismissBrandReportAction(reportId: string, note?: string) {
  return updateBrandReportAction(reportId, {
    status: "Dismissed",
    note: note?.trim() || undefined,
  });
}

export async function getBrandReportAttachmentUrlAction(storagePath: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (!storagePath || storagePath.includes("..")) {
    return { error: "Invalid attachment path." };
  }

  if (!isSupabaseConfigured()) {
    return { url: "#" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BRAND_REPORT_STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error || !data?.signedUrl) {
    return { error: error?.message ?? "Unable to generate download link." };
  }

  return { url: data.signedUrl };
}

export async function loadBrandReportEventsAction(reportId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const events = await getBrandReportEvents(reportId);
  return { events };
}
