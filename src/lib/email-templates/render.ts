import { renderAdminNewBrandApplicationEmail } from "@/lib/email-templates/templates/admin/new-brand-application";
import { renderMemberFreeTrialEndedEmail } from "@/lib/email-templates/templates/member/free-trial-ended";
import { renderMemberFreeTrialReminderEmail } from "@/lib/email-templates/templates/member/free-trial-reminder";
import { renderMemberFreeTrialStartedEmail } from "@/lib/email-templates/templates/member/free-trial-started";
import { renderMemberMembershipActivatedEmail } from "@/lib/email-templates/templates/member/membership-activated";
import { renderMemberPasswordResetEmail } from "@/lib/email-templates/templates/member/password-reset";
import { renderMemberVerifyEmail } from "@/lib/email-templates/templates/member/verify-email";
import { renderMemberWelcomeEmail } from "@/lib/email-templates/templates/member/welcome";
import { renderPartnerApplicationApprovedEmail } from "@/lib/email-templates/templates/partner/application-approved";
import { renderPartnerApplicationReceivedEmail } from "@/lib/email-templates/templates/partner/application-received";
import { renderPartnerApplicationRejectedEmail } from "@/lib/email-templates/templates/partner/application-rejected";
import { renderPartnerListingLiveEmail } from "@/lib/email-templates/templates/partner/listing-live";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type EmailTemplateId =
  | "member.welcome"
  | "member.verify-email"
  | "member.free-trial-started"
  | "member.free-trial-reminder"
  | "member.free-trial-ended"
  | "member.membership-activated"
  | "member.password-reset"
  | "partner.application-received"
  | "partner.application-approved"
  | "partner.listing-live"
  | "partner.application-rejected"
  | "admin.new-brand-application";

export function renderEmailTemplate(
  templateId: EmailTemplateId,
  params: Record<string, unknown>
): RenderedEmail {
  switch (templateId) {
    case "member.welcome":
      return renderMemberWelcomeEmail({
        appUrl: String(params.appUrl ?? ""),
        firstName: params.firstName as string | null | undefined,
      });
    case "member.verify-email":
      return renderMemberVerifyEmail({
        appUrl: String(params.appUrl ?? ""),
        firstName: params.firstName as string | null | undefined,
        verificationUrl: String(params.verificationUrl ?? ""),
      });
    case "member.free-trial-started":
      return renderMemberFreeTrialStartedEmail({
        appUrl: String(params.appUrl ?? ""),
        firstName: params.firstName as string | null | undefined,
        trialLengthDays: Number(params.trialLengthDays ?? 7),
      });
    case "member.free-trial-reminder":
      return renderMemberFreeTrialReminderEmail({
        appUrl: String(params.appUrl ?? ""),
        firstName: params.firstName as string | null | undefined,
        daysRemaining: params.daysRemaining === 1 ? 1 : 3,
      });
    case "member.free-trial-ended":
      return renderMemberFreeTrialEndedEmail({
        appUrl: String(params.appUrl ?? ""),
        firstName: params.firstName as string | null | undefined,
      });
    case "member.membership-activated":
      return renderMemberMembershipActivatedEmail({
        appUrl: String(params.appUrl ?? ""),
        firstName: params.firstName as string | null | undefined,
      });
    case "member.password-reset":
      return renderMemberPasswordResetEmail({
        appUrl: String(params.appUrl ?? ""),
        firstName: params.firstName as string | null | undefined,
        resetUrl: String(params.resetUrl ?? ""),
      });
    case "partner.application-received":
      return renderPartnerApplicationReceivedEmail({
        appUrl: String(params.appUrl ?? ""),
        contactName: params.contactName as string | null | undefined,
        businessName: String(params.businessName ?? ""),
      });
    case "partner.application-approved":
      return renderPartnerApplicationApprovedEmail({
        appUrl: String(params.appUrl ?? ""),
        contactName: params.contactName as string | null | undefined,
        businessName: String(params.businessName ?? ""),
        memberCode: params.memberCode as string | null | undefined,
      });
    case "partner.listing-live":
      return renderPartnerListingLiveEmail({
        appUrl: String(params.appUrl ?? ""),
        contactName: params.contactName as string | null | undefined,
        businessName: String(params.businessName ?? ""),
        brandProfileUrl: params.brandProfileUrl as string | null | undefined,
      });
    case "partner.application-rejected":
      return renderPartnerApplicationRejectedEmail({
        appUrl: String(params.appUrl ?? ""),
        contactName: params.contactName as string | null | undefined,
        businessName: String(params.businessName ?? ""),
      });
    case "admin.new-brand-application":
      return renderAdminNewBrandApplicationEmail({
        appUrl: String(params.appUrl ?? ""),
        brandName: String(params.brandName ?? ""),
        businessName: String(params.businessName ?? ""),
        contactName: String(params.contactName ?? ""),
        contactEmail: String(params.contactEmail ?? ""),
        submittedAt:
          params.submittedAt instanceof Date
            ? params.submittedAt
            : new Date(String(params.submittedAt ?? Date.now())),
      });
    default: {
      const exhaustive: never = templateId;
      throw new Error(`Unknown email template: ${exhaustive}`);
    }
  }
}

export {
  renderAdminNewBrandApplicationEmail,
  renderMemberFreeTrialEndedEmail,
  renderMemberFreeTrialReminderEmail,
  renderMemberFreeTrialStartedEmail,
  renderMemberMembershipActivatedEmail,
  renderMemberPasswordResetEmail,
  renderMemberVerifyEmail,
  renderMemberWelcomeEmail,
  renderPartnerApplicationApprovedEmail,
  renderPartnerListingLiveEmail,
  renderPartnerApplicationReceivedEmail,
  renderPartnerApplicationRejectedEmail,
};
