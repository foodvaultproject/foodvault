import {
  getEmailAppUrl,
  sendPlatformEmailSafe,
} from "@/lib/email-templates/send";
import {
  renderMemberFreeTrialEndedEmail,
  renderMemberFreeTrialReminderEmail,
  renderMemberFreeTrialStartedEmail,
  renderMemberMembershipActivatedEmail,
  renderPartnerApplicationApprovedEmail,
  renderPartnerApplicationReceivedEmail,
  renderPartnerApplicationRejectedEmail,
} from "@/lib/email-templates/render";
import { renderPartnerListingLiveEmail } from "@/lib/email-templates/templates/partner/listing-live";
import { renderAdminNewBrandApplicationEmail } from "@/lib/email-templates/templates/admin/new-brand-application";
import { getMembershipSettings } from "@/lib/member/settings";
import { partnerProfilePathFromSlug } from "@/lib/member/favorites-utils";
import { createAdminClient } from "@/lib/supabase/admin";

export const PARTNER_SUBMISSION_ADMIN_EMAIL =
  process.env.PARTNER_SUBMISSION_ADMIN_EMAIL ?? "mark@benchmark-int.com";

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

export async function sendMemberFreeTrialStartedEmail(input: {
  to: string;
  firstName?: string | null;
  trialLengthDays?: number;
}) {
  const appUrl = getEmailAppUrl();
  const settings = await getMembershipSettings();

  return sendPlatformEmailSafe({
    to: input.to,
    rendered: renderMemberFreeTrialStartedEmail({
      appUrl,
      firstName: input.firstName,
      trialLengthDays: input.trialLengthDays ?? settings.trialLengthDays,
    }),
  });
}

export async function sendMemberFreeTrialReminderEmail(input: {
  to: string;
  firstName?: string | null;
  daysRemaining: 1 | 3;
}) {
  const appUrl = getEmailAppUrl();
  return sendPlatformEmailSafe({
    to: input.to,
    rendered: renderMemberFreeTrialReminderEmail({
      appUrl,
      firstName: input.firstName,
      daysRemaining: input.daysRemaining,
    }),
  });
}

export async function sendMemberFreeTrialEndedEmail(input: {
  to: string;
  firstName?: string | null;
}) {
  const appUrl = getEmailAppUrl();
  return sendPlatformEmailSafe({
    to: input.to,
    rendered: renderMemberFreeTrialEndedEmail({
      appUrl,
      firstName: input.firstName,
    }),
  });
}

export async function sendMemberMembershipActivatedEmail(input: {
  to: string;
  firstName?: string | null;
}) {
  const appUrl = getEmailAppUrl();
  return sendPlatformEmailSafe({
    to: input.to,
    rendered: renderMemberMembershipActivatedEmail({
      appUrl,
      firstName: input.firstName,
    }),
  });
}

export async function sendPartnerApplicationReceivedEmail(input: {
  to: string;
  contactName?: string | null;
  businessName: string;
}) {
  const appUrl = getEmailAppUrl();
  return sendPlatformEmailSafe({
    to: input.to,
    rendered: renderPartnerApplicationReceivedEmail({
      appUrl,
      contactName: input.contactName,
      businessName: input.businessName,
    }),
  });
}

export async function sendPartnerApplicationApprovedEmail(input: {
  to: string;
  contactName?: string | null;
  businessName: string;
  memberCode?: string | null;
}) {
  const appUrl = getEmailAppUrl();

  return sendPlatformEmailSafe({
    to: input.to,
    rendered: renderPartnerApplicationApprovedEmail({
      appUrl,
      contactName: input.contactName,
      businessName: input.businessName,
      memberCode: input.memberCode,
    }),
  });
}

export async function sendPartnerListingLiveEmail(input: {
  to: string;
  contactName?: string | null;
  businessName: string;
  slug?: string | null;
}) {
  const appUrl = getEmailAppUrl();
  const brandProfileUrl = input.slug
    ? `${appUrl.replace(/\/$/, "")}${partnerProfilePathFromSlug(input.slug)}`
    : null;

  return sendPlatformEmailSafe({
    to: input.to,
    rendered: renderPartnerListingLiveEmail({
      appUrl,
      contactName: input.contactName,
      businessName: input.businessName,
      brandProfileUrl,
    }),
  });
}

export async function sendPartnerApplicationRejectedEmail(input: {
  to: string;
  contactName?: string | null;
  businessName: string;
}) {
  const appUrl = getEmailAppUrl();
  return sendPlatformEmailSafe({
    to: input.to,
    rendered: renderPartnerApplicationRejectedEmail({
      appUrl,
      contactName: input.contactName,
      businessName: input.businessName,
    }),
  });
}

export async function sendAdminNewBrandApplicationEmail(input: {
  brandName: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  submittedAt?: Date;
}) {
  const appUrl = getEmailAppUrl();
  return sendPlatformEmailSafe({
    to: PARTNER_SUBMISSION_ADMIN_EMAIL,
    rendered: renderAdminNewBrandApplicationEmail({
      appUrl,
      brandName: input.brandName,
      businessName: input.businessName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      submittedAt: input.submittedAt ?? new Date(),
    }),
  });
}

export async function notifyPartnerLifecycleEmails(partnerId: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { sent: false as const, reason: "admin_unavailable" as const };
  }

  const { data: partner, error } = await admin
    .from("partners")
    .select(
      "id, user_id, business_name, support_email, slug, application_status_v2, contact_name"
    )
    .eq("id", partnerId)
    .maybeSingle();

  if (error || !partner) {
    return { sent: false as const, reason: "partner_not_found" as const };
  }

  const { data: userData } = await admin.auth.admin.getUserById(String(partner.user_id));
  const contactName =
    partner.contact_name?.trim() ||
    resolveContactName(userData?.user?.user_metadata) ||
    partner.business_name ||
    null;
  const contactEmail =
    partner.support_email?.trim() || userData?.user?.email?.trim() || "";

  if (!contactEmail) {
    return { sent: false as const, reason: "missing_email" as const };
  }

  const businessName = partner.business_name?.trim() || "your brand";

  if (partner.application_status_v2 === "APPLICATION_UNDER_REVIEW") {
    await sendPartnerApplicationReceivedEmail({
      to: contactEmail,
      contactName,
      businessName,
    });

    await sendAdminNewBrandApplicationEmail({
      brandName: businessName,
      businessName,
      contactName: contactName ?? "Not provided",
      contactEmail,
    });

    return { sent: true as const, type: "application_received" as const };
  }

  return { sent: false as const, reason: "unsupported_status" as const };
}

export async function sendPartnerApprovalEmail(partnerId: string) {
  const admin = createAdminClient();
  if (!admin) return { sent: false as const, reason: "admin_unavailable" as const };

  const { data: partner } = await admin
    .from("partners")
    .select("business_name, support_email, slug, user_id, contact_name, member_code")
    .eq("id", partnerId)
    .maybeSingle();

  if (!partner) return { sent: false as const, reason: "partner_not_found" as const };

  const { data: userData } = await admin.auth.admin.getUserById(String(partner.user_id));
  const contactEmail =
    partner.support_email?.trim() || userData?.user?.email?.trim() || "";
  if (!contactEmail) return { sent: false as const, reason: "missing_email" as const };

  return sendPartnerApplicationApprovedEmail({
    to: contactEmail,
    contactName:
      partner.contact_name?.trim() ||
      resolveContactName(userData?.user?.user_metadata) ||
      null,
    businessName: partner.business_name?.trim() || "your brand",
    memberCode: partner.member_code?.trim() || null,
  });
}

export async function sendPartnerListingLiveEmailForPartner(partnerId: string) {
  const admin = createAdminClient();
  if (!admin) return { sent: false as const, reason: "admin_unavailable" as const };

  const { data: partner } = await admin
    .from("partners")
    .select("business_name, support_email, slug, user_id, contact_name, listing_status_v2")
    .eq("id", partnerId)
    .maybeSingle();

  if (!partner) return { sent: false as const, reason: "partner_not_found" as const };

  if (String(partner.listing_status_v2).toUpperCase() !== "LIVE") {
    return { sent: false as const, reason: "listing_not_live" as const };
  }

  const { data: userData } = await admin.auth.admin.getUserById(String(partner.user_id));
  const contactEmail =
    partner.support_email?.trim() || userData?.user?.email?.trim() || "";
  if (!contactEmail) return { sent: false as const, reason: "missing_email" as const };

  return sendPartnerListingLiveEmail({
    to: contactEmail,
    contactName:
      partner.contact_name?.trim() ||
      resolveContactName(userData?.user?.user_metadata) ||
      null,
    businessName: partner.business_name?.trim() || "your brand",
    slug: partner.slug,
  });
}

export async function sendPartnerRejectionEmail(partnerId: string) {
  const admin = createAdminClient();
  if (!admin) return { sent: false as const, reason: "admin_unavailable" as const };

  const { data: partner } = await admin
    .from("partners")
    .select("business_name, support_email, user_id, contact_name")
    .eq("id", partnerId)
    .maybeSingle();

  if (!partner) return { sent: false as const, reason: "partner_not_found" as const };

  const { data: userData } = await admin.auth.admin.getUserById(String(partner.user_id));
  const contactEmail =
    partner.support_email?.trim() || userData?.user?.email?.trim() || "";
  if (!contactEmail) return { sent: false as const, reason: "missing_email" as const };

  return sendPartnerApplicationRejectedEmail({
    to: contactEmail,
    contactName:
      partner.contact_name?.trim() ||
      resolveContactName(userData?.user?.user_metadata) ||
      null,
    businessName: partner.business_name?.trim() || "your brand",
  });
}
