import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type PartnerActivationReminderNumber = 1 | 2 | 3;

export type PartnerActivationReminderEmailParams = {
  appUrl: string;
  contactName?: string | null;
  businessName: string;
  memberCode?: string | null;
  reminderNumber: PartnerActivationReminderNumber;
};

const REMINDER_COPY: Record<
  PartnerActivationReminderNumber,
  { subject: string; heading: string; intro: string; button: string; preheader: string }
> = {
  1: {
    subject: "Reminder: confirm your FoodVault member offer to go live",
    heading: "Reminder: confirm your member offer",
    intro:
      "This is a friendly reminder that <strong>{businessName}</strong> has been approved on FoodVault, but your listing is <strong>not live yet</strong>.",
    button: "Log in to FoodVault",
    preheader:
      "Your FoodVault listing is approved but not live yet. Log in and confirm your member discount code is active.",
  },
  2: {
    subject: "Second reminder: your FoodVault listing is waiting to go live",
    heading: "Second reminder: your listing is waiting",
    intro:
      "We're following up because <strong>{businessName}</strong> is approved on FoodVault but <strong>still not live</strong>.",
    button: "Log in and confirm now",
    preheader:
      "Your brand is still not visible to FoodVault members. Confirm your member discount code to activate your listing.",
  },
  3: {
    subject: "Final reminder: activate your FoodVault listing today",
    heading: "Final reminder: activate your listing",
    intro:
      "This is our <strong>final reminder</strong> that <strong>{businessName}</strong> is approved on FoodVault but <strong>has not been activated yet</strong>.",
    button: "Activate my listing",
    preheader:
      "Last reminder — confirm your member discount code so your brand can go live on FoodVault.",
  },
};

export function renderPartnerActivationReminderEmail(
  params: PartnerActivationReminderEmailParams
): RenderedEmail {
  const contactName = params.contactName?.trim();
  const greeting = contactName ? `Kia ora ${escapeHtml(contactName)},` : "Kia ora,";
  const businessName = escapeHtml(params.businessName);
  const loginUrl = `${params.appUrl.replace(/\/$/, "")}/partner-login`;
  const listingUrl = `${params.appUrl.replace(/\/$/, "")}/partner/listing`;
  const memberCode = params.memberCode?.trim();
  const copy = REMINDER_COPY[params.reminderNumber];

  const membersCannotDiscover =
    params.reminderNumber === 1
      ? "Members cannot discover your brand until you complete one quick step:"
      : params.reminderNumber === 2
        ? "Without this step, members won't be able to find your brand or use your member offer:"
        : "Your listing remains hidden from members until you confirm your member offer is live on your website:";

  const closingParagraph =
    params.reminderNumber === 1
      ? `Once you confirm, we'll send a final email when <strong>${businessName}</strong> is live for members.`
      : params.reminderNumber === 2
        ? `This only takes a few minutes. Once confirmed, your listing goes live and members can start discovering <strong>${businessName}</strong>.`
        : `If you've already completed this step, you can ignore this email — your confirmation may still be processing. If you need assistance getting set up, reply to this email and our team will help you get <strong>${businessName}</strong> live.`;

  const helpParagraph =
    params.reminderNumber === 2
      ? `Questions? Reply to this email or visit <a href="${escapeHtml(listingUrl)}" style="color:#8b7cf6;font-weight:600;text-decoration:none;">My Listing</a> in your partner portal.`
      : `Need help? Open <a href="${escapeHtml(listingUrl)}" style="color:#8b7cf6;font-weight:600;text-decoration:none;">My Listing</a> once you're logged in.`;

  const content = [
    emailHeading(copy.heading),
    emailParagraph(greeting),
    emailParagraph(copy.intro.replace("{businessName}", businessName)),
    emailParagraph(membersCannotDiscover),
    emailList([
      "Log in to your FoodVault partner account",
      params.reminderNumber === 2
        ? "Make sure your FoodVault member discount code is active on your website checkout"
        : params.reminderNumber === 3
          ? "Add or verify your FoodVault member discount code on your website checkout"
          : "Add your FoodVault member discount code to your website checkout",
      'Open My Listing and click "I\'ve Activated My Member Offer"',
    ]),
    memberCode
      ? emailParagraph(
          `Your FoodVault member discount code: <strong style="font-size:18px;letter-spacing:0.04em;">${escapeHtml(memberCode)}</strong>`
        )
      : "",
    emailButton(loginUrl, copy.button),
    emailParagraph(closingParagraph),
    emailParagraph(helpParagraph),
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: copy.subject,
    html: wrapEmailContent(
      params.appUrl,
      content,
      copy.preheader.replace("{businessName}", params.businessName)
    ),
  };
}
