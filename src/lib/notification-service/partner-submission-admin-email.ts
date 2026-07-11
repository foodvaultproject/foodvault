import { createAdminClient } from "@/lib/supabase/admin";
import { getNotificationServiceConfig } from "@/lib/notification-service/config";
import { sendResendEmail } from "@/lib/notification-service/providers/resend";

export const PARTNER_SUBMISSION_ADMIN_EMAIL =
  process.env.PARTNER_SUBMISSION_ADMIN_EMAIL ?? "mark@benchmark-int.com";

export type PartnerSubmissionAdminEmailInput = {
  businessName: string;
  contactName: string;
  contactEmail: string;
  submittedAt: Date;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatSubmissionDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Pacific/Auckland",
  }).format(date);
}

export function renderPartnerSubmissionAdminEmail(
  input: PartnerSubmissionAdminEmailInput
) {
  const businessName = escapeHtml(input.businessName);
  const contactName = escapeHtml(input.contactName);
  const contactEmail = escapeHtml(input.contactEmail);
  const submittedAt = escapeHtml(formatSubmissionDateTime(input.submittedAt));
  const { appUrl } = getNotificationServiceConfig();
  const adminUrl = `${appUrl.replace(/\/$/, "")}/admin/partner-applications`;

  const subject = "New Partner Listing Submitted for Review";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>A new partner has submitted their FoodVault listing for approval.</p>
      <p><strong>Business Name:</strong><br />${businessName}</p>
      <p><strong>Contact:</strong><br />${contactName}</p>
      <p><strong>Email:</strong><br />${contactEmail}</p>
      <p><strong>Submitted:</strong><br />${submittedAt}</p>
      <p>
        Please log in to the FoodVault Admin Dashboard to review this application.
      </p>
      <p>
        <a href="${adminUrl}" style="color: #4f46e5; font-weight: 600;">
          Open Partner Applications
        </a>
      </p>
    </div>
  `.trim();

  return { subject, html };
}

export async function sendPartnerSubmissionAdminEmail(
  input: PartnerSubmissionAdminEmailInput
) {
  const { isConfigured } = getNotificationServiceConfig();
  if (!isConfigured) {
    console.warn(
      "[partner-submission] Skipping admin email — Resend is not configured"
    );
    return { sent: false as const, reason: "not_configured" as const };
  }

  const rendered = renderPartnerSubmissionAdminEmail(input);

  await sendResendEmail({
    to: PARTNER_SUBMISSION_ADMIN_EMAIL,
    subject: rendered.subject,
    html: rendered.html,
  });

  return { sent: true as const };
}

function resolveContactName(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return null;

  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  if (fullName) return fullName;

  const name = typeof metadata.name === "string" ? metadata.name.trim() : "";
  if (name) return name;

  const firstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const lastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
  const combined = `${firstName} ${lastName}`.trim();
  return combined || null;
}

export async function notifyAdminPartnerListingSubmitted(partnerId: string) {
  const admin = createAdminClient();
  if (!admin) {
    console.warn(
      "[partner-submission] Skipping admin email — admin client unavailable"
    );
    return { sent: false as const, reason: "admin_unavailable" as const };
  }

  const { data: partner, error } = await admin
    .from("partners")
    .select("id, user_id, business_name, support_email, application_status_v2")
    .eq("id", partnerId)
    .maybeSingle();

  if (error || !partner) {
    console.error("[partner-submission] Partner record not found", {
      partnerId,
      error,
    });
    return { sent: false as const, reason: "partner_not_found" as const };
  }

  if (partner.application_status_v2 !== "APPLICATION_UNDER_REVIEW") {
    return { sent: false as const, reason: "not_pending_review" as const };
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(
    String(partner.user_id)
  );

  if (userError || !userData.user) {
    console.error("[partner-submission] Partner auth user not found", {
      partnerId,
      userError,
    });
    return { sent: false as const, reason: "user_not_found" as const };
  }

  const contactName =
    resolveContactName(userData.user.user_metadata) ??
    partner.business_name ??
    "Not provided";
  const contactEmail =
    partner.support_email?.trim() ||
    userData.user.email?.trim() ||
    "Not provided";

  return sendPartnerSubmissionAdminEmail({
    businessName: partner.business_name?.trim() || "Not provided",
    contactName,
    contactEmail,
    submittedAt: new Date(),
  });
}
