"use server";

import { isSupabaseConfigured } from "@/lib/auth";
import {
  BRAND_REPORT_MAX_ATTACHMENTS,
  BRAND_REPORT_MAX_DESCRIPTION,
  BRAND_REPORT_STORAGE_BUCKET,
  isBrandReportReason,
  validateBrandReportAttachment,
} from "@/lib/brand-reports/constants";
import { requireAuthenticatedMember } from "@/lib/member/auth";
import { createClient } from "@/lib/supabase/server";

type SubmitBrandReportInput = {
  brandId: string;
  reason: string;
  description: string;
  contactPermission: boolean;
};

export async function submitBrandReportAction(
  input: SubmitBrandReportInput,
  formData: FormData
) {
  await requireAuthenticatedMember();

  if (!input.brandId) {
    return { error: "Brand not found." };
  }

  if (!isBrandReportReason(input.reason)) {
    return { error: "Please select a valid reason." };
  }

  const description = input.description.trim();
  if (!description) {
    return { error: "Please describe the issue." };
  }
  if (description.length > BRAND_REPORT_MAX_DESCRIPTION) {
    return {
      error: `Description must be ${BRAND_REPORT_MAX_DESCRIPTION} characters or fewer.`,
    };
  }

  const files = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length > BRAND_REPORT_MAX_ATTACHMENTS) {
    return { error: `You can upload up to ${BRAND_REPORT_MAX_ATTACHMENTS} files.` };
  }

  for (const file of files) {
    const validationError = validateBrandReportAttachment(file);
    if (validationError) {
      return { error: validationError };
    }
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true as const,
      reportReference: "BR-000127",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  const attachmentUrls: string[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BRAND_REPORT_STORAGE_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    attachmentUrls.push(path);
  }

  const { data, error } = await supabase.rpc("submit_brand_report", {
    p_brand_id: input.brandId,
    p_reason: input.reason,
    p_description: description,
    p_contact_permission: input.contactPermission,
    p_attachment_urls: attachmentUrls,
  });

  if (error) {
    return { error: error.message };
  }

  const payload = data as { report_reference?: string } | null;

  return {
    success: true as const,
    reportReference: payload?.report_reference ?? "BR-000000",
  };
}
