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
  renderMemberFreeTrialStartedEmail,
  renderMemberFreeTrialReminderEmail,
  renderMemberFreeTrialEndedEmail,
  renderMemberMembershipActivatedEmail,
  renderMemberPasswordResetEmail,
  renderPartnerApplicationReceivedEmail,
  renderPartnerApplicationApprovedEmail,
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
  sendMemberWelcomeEmail,
  sendMemberFreeTrialStartedEmail,
  sendMemberFreeTrialReminderEmail,
  sendMemberFreeTrialEndedEmail,
  sendMemberMembershipActivatedEmail,
  sendPartnerApplicationReceivedEmail,
  sendPartnerApplicationApprovedEmail,
  sendPartnerApplicationRejectedEmail,
  sendAdminNewBrandApplicationEmail,
  sendMemberSignupEmails,
  sendPartnerApprovalEmail,
  sendPartnerRejectionEmail,
  notifyPartnerLifecycleEmails,
} from "@/lib/email-templates/dispatch";
export { processMemberTrialEmails } from "@/lib/email-templates/trial-cron";
