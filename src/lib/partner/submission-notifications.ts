"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyAdminPartnerListingSubmitted } from "@/lib/notification-service/partner-submission-admin-email";
import { sendPartnerApplicationReceivedEmail } from "@/lib/email-templates/dispatch";

/**
 * Sends the admin notification after a partner listing is submitted for review.
 * Called only from the partner application submit flow — not from draft saves.
 */
export async function notifyAdminPartnerListingSubmittedAction(partnerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sent: false as const, reason: "unauthorized" as const };
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("id, user_id, application_status_v2")
    .eq("id", partnerId)
    .maybeSingle();

  if (!partner || partner.user_id !== user.id) {
    return { sent: false as const, reason: "forbidden" as const };
  }

  if (partner.application_status_v2 !== "APPLICATION_UNDER_REVIEW") {
    return { sent: false as const, reason: "not_pending_review" as const };
  }

  try {
    const adminResult = await notifyAdminPartnerListingSubmitted(partnerId);

    const { data: partnerDetails } = await supabase
      .from("partners")
      .select("business_name, support_email, contact_name")
      .eq("id", partnerId)
      .maybeSingle();

    const partnerEmail =
      partnerDetails?.support_email?.trim() || user.email?.trim() || "";

    if (partnerEmail && partnerDetails?.business_name) {
      await sendPartnerApplicationReceivedEmail({
        to: partnerEmail,
        contactName: partnerDetails.contact_name ?? user.user_metadata?.first_name ?? null,
        businessName: partnerDetails.business_name,
      });
    }

    return adminResult;
  } catch (error) {
    console.error("[partner-submission] Failed to send admin notification", {
      partnerId,
      error: error instanceof Error ? error.message : error,
    });
    return { sent: false as const, reason: "send_failed" as const };
  }
}
