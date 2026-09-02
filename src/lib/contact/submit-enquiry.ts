"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/auth";
import {
  generateEnquiryReferenceNumber,
  isUniqueConstraintError,
} from "@/lib/contact/reference-number";
import { sendAdminContactEnquiryEmail } from "@/lib/email-templates/dispatch";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_NAME_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "application/pdf",
]);
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set(["png", "jpg", "jpeg", "pdf"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_ENQUIRY_TYPES = ["MEMBER", "PARTNER", "GENERAL"] as const;
type ContactEnquiryType = (typeof CONTACT_ENQUIRY_TYPES)[number];

const CONTACT_TYPE_MAP: Record<string, ContactEnquiryType> = {
  member: "MEMBER",
  partner: "PARTNER",
  affiliate: "GENERAL",
  general: "GENERAL",
  "not-sure": "GENERAL",
};

export type SubmitContactEnquiryResult =
  | { success: true; referenceNumber: string; emailSent: true }
  | { success: true; referenceNumber: string; emailSent: false; error: string }
  | { error: string };

function mapContactTypeToEnquiryType(
  contactType: string | null
): ContactEnquiryType | null {
  if (!contactType) return null;
  return CONTACT_TYPE_MAP[contactType.trim().toLowerCase()] ?? null;
}

function readTrimmed(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function collectAttachmentFiles(formData: FormData) {
  return formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function isAllowedAttachment(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (file.type && ALLOWED_ATTACHMENT_TYPES.has(file.type)) return true;
  return ALLOWED_ATTACHMENT_EXTENSIONS.has(extension);
}

function appendAttachmentNotes(message: string, files: File[]) {
  if (files.length === 0) return message;

  const names = files.map((file) => file.name.trim() || "unnamed-file");
  const note = `[Attachments noted but not uploaded: ${names.join(", ")}]`;
  return `${message}\n\n${note}`;
}

async function getEnquiryWriteClient() {
  const admin = createAdminClient();
  if (admin) return admin;
  if (!isSupabaseConfigured()) return null;
  return createClient();
}

export async function submitContactEnquiryAction(
  formData: FormData
): Promise<SubmitContactEnquiryResult> {
  const fullName = readTrimmed(formData, "fullName");
  const email = readTrimmed(formData, "email");
  const subject = readTrimmed(formData, "subject");
  const message = readTrimmed(formData, "message");
  const contactType = readTrimmed(formData, "contactType");
  const consent = readTrimmed(formData, "consent");
  const enquiryType = mapContactTypeToEnquiryType(contactType);

  if (!fullName) return { error: "Please enter your full name." };
  if (fullName.length > MAX_NAME_LENGTH) {
    return { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` };
  }

  if (!email) return { error: "Please enter your email address." };
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Please enter a valid email address." };
  }

  if (!enquiryType) {
    return { error: "Please select who you are contacting as." };
  }

  if (!subject) return { error: "Please enter a subject." };
  if (subject.length > MAX_SUBJECT_LENGTH) {
    return { error: `Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer.` };
  }

  if (!message) return { error: "Please enter a message." };
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` };
  }

  if (!consent) {
    return { error: "Please agree to the Privacy Policy to send your enquiry." };
  }

  const attachments = collectAttachmentFiles(formData);
  for (const file of attachments) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return { error: `${file.name} is larger than 10MB.` };
    }
    if (!isAllowedAttachment(file)) {
      return { error: `${file.name} must be a PNG, JPG, or PDF.` };
    }
  }

  const supabase = await getEnquiryWriteClient();
  if (!supabase) {
    return {
      error: "We couldn't save your enquiry right now. Please try again shortly.",
    };
  }

  const storedMessage = appendAttachmentNotes(message, attachments);
  const maxAttempts = 8;
  let referenceNumber = "";
  let inserted = false;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    referenceNumber = generateEnquiryReferenceNumber();
    const { error } = await supabase.from("contact_enquiries").insert({
      reference_number: referenceNumber,
      name: fullName,
      email,
      enquiry_type: enquiryType,
      subject,
      message: storedMessage,
      status: "NEW",
    });

    if (!error) {
      inserted = true;
      break;
    }

    if (isUniqueConstraintError(error) && attempt < maxAttempts - 1) {
      continue;
    }

    console.error("[contact] Failed to insert enquiry", error);
    return {
      error: "We couldn't save your enquiry right now. Please try again shortly.",
    };
  }

  if (!inserted || !referenceNumber) {
    return {
      error: "We couldn't save your enquiry right now. Please try again shortly.",
    };
  }

  revalidatePath("/admin/contact");
  revalidatePath("/admin/dashboard");

  try {
    await sendAdminContactEnquiryEmail({
      referenceNumber,
      name: fullName,
      email,
      enquiryType,
      subject,
      message: storedMessage,
    });
  } catch (error) {
    console.error("[CONTACT_EMAIL_ERROR]:", error);
    return {
      success: true,
      referenceNumber,
      emailSent: false,
      error:
        error instanceof Error
          ? error.message
          : "Enquiry saved, but the notification email could not be sent.",
    };
  }

  return { success: true, referenceNumber, emailSent: true };
}
