export type { RenderedEmail } from "@/lib/email-templates/types";
export type { EmailTemplateId } from "@/lib/email-templates/render";
export { EMAIL_BRAND } from "@/lib/email-templates/brand";
export { wrapEmailContent, renderEmailLayout } from "@/lib/email-templates/layout/base-layout";
export {
  emailButton,
  emailDetailRow,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
export {
  renderEmailTemplate,
  renderMemberWelcomeEmail,
  renderMemberVerifyEmail,
  renderMemberMembershipActivatedEmail,
  renderMemberPasswordResetEmail,
  renderPartnerApplicationReceivedEmail,
  renderPartnerApplicationApprovedEmail,
  renderPartnerListingLiveEmail,
  renderPartnerHospitalityListingLiveEmail,
  renderPartnerApplicationRejectedEmail,
  renderAdminNewBrandApplicationEmail,
} from "@/lib/email-templates/render";
export {
  sendPlatformEmail,
  sendPlatformEmailSafe,
  getEmailAppUrl,
} from "@/lib/email-templates/send";
export {
  PARTNER_SUBMISSION_ADMIN_EMAIL,
  sendMemberMembershipActivatedEmail,
  sendPartnerApplicationReceivedEmail,
  sendPartnerApplicationApprovedEmail,
  sendPartnerListingLiveEmail,
  sendPartnerHospitalityListingLiveEmail,
  sendPartnerApplicationRejectedEmail,
  sendAdminNewBrandApplicationEmail,
  sendPartnerApprovalEmail,
  sendPartnerActivationReminderEmail,
  sendPartnerListingLiveEmailForPartner,
  sendPartnerRejectionEmail,
  notifyPartnerLifecycleEmails,
} from "@/lib/email-templates/dispatch";
export { processPartnerActivationReminderEmails } from "@/lib/email-templates/partner-activation-cron";
