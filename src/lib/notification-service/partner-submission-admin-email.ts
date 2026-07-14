import {
  PARTNER_SUBMISSION_ADMIN_EMAIL,
  sendAdminNewBrandApplicationEmail,
} from "@/lib/email-templates/dispatch";
import { renderAdminNewBrandApplicationEmail } from "@/lib/email-templates/templates/admin/new-brand-application";
import { createAdminClient } from "@/lib/supabase/admin";

export { PARTNER_SUBMISSION_ADMIN_EMAIL };

export type PartnerSubmissionAdminEmailInput = {
  businessName: string;
  contactName: string;
  contactEmail: string;
  submittedAt: Date;
};

export function renderPartnerSubmissionAdminEmail(
  input: PartnerSubmissionAdminEmailInput
) {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return renderAdminNewBrandApplicationEmail({
    appUrl,
    brandName: input.businessName,
    businessName: input.businessName,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    submittedAt: input.submittedAt,
  });
}

export async function sendPartnerSubmissionAdminEmail(
  input: PartnerSubmissionAdminEmailInput
) {
  return sendAdminNewBrandApplicationEmail({
    brandName: input.businessName,
    businessName: input.businessName,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    submittedAt: input.submittedAt,
  });
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
