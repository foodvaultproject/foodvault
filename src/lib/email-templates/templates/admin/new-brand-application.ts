import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailDetailRow,
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type AdminNewBrandApplicationEmailParams = {
  appUrl: string;
  brandName: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  submittedAt: Date;
};

function formatSubmissionDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Pacific/Auckland",
  }).format(date);
}

export function renderAdminNewBrandApplicationEmail(
  params: AdminNewBrandApplicationEmailParams
): RenderedEmail {
  const adminUrl = `${params.appUrl.replace(/\/$/, "")}/admin/partner-applications`;

  const content = [
    emailHeading("New brand application"),
    emailParagraph(
      "A new FoodVault brand application has been submitted and is ready for review."
    ),
    emailDetailRow("Brand name", params.brandName),
    emailDetailRow("Business name", params.businessName),
    emailDetailRow("Contact name", params.contactName),
    emailDetailRow("Email", params.contactEmail),
    emailDetailRow("Submitted", formatSubmissionDateTime(params.submittedAt)),
    emailButton(adminUrl, "Review Application"),
    emailParagraph("Please review the application in the FoodVault admin portal."),
  ].join("");

  return {
    subject: "New FoodVault Brand Application",
    html: wrapEmailContent(
      params.appUrl,
      content,
      `New FoodVault brand application from ${escapeHtml(params.businessName)}.`
    ),
  };
}
