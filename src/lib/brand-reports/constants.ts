export const BRAND_REPORT_REASONS = [
  { value: "misleading_information", label: "Misleading or inaccurate information" },
  { value: "incorrect_discounts", label: "Incorrect discounts or offers" },
  { value: "offensive_content", label: "Offensive or inappropriate content" },
  { value: "copyright_infringement", label: "Copyright or trademark infringement" },
  { value: "scam_fraud", label: "Scam or fraudulent activity" },
  { value: "counterfeit_products", label: "Counterfeit products" },
  { value: "dangerous_products", label: "Dangerous or prohibited products" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
] as const;

export type BrandReportReason = (typeof BRAND_REPORT_REASONS)[number]["value"];

export const BRAND_REPORT_STATUSES = [
  "New",
  "Under Review",
  "Awaiting Information",
  "Resolved",
  "Dismissed",
] as const;

export type BrandReportStatus = (typeof BRAND_REPORT_STATUSES)[number];

export const BRAND_REPORT_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;

export type BrandReportPriority = (typeof BRAND_REPORT_PRIORITIES)[number];

export const BRAND_REPORT_MAX_DESCRIPTION = 1000;
export const BRAND_REPORT_MAX_ATTACHMENTS = 5;
export const BRAND_REPORT_MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const BRAND_REPORT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export const BRAND_REPORT_STORAGE_BUCKET = "brand-report-attachments";

export function brandReportReasonLabel(reason: string) {
  return (
    BRAND_REPORT_REASONS.find((item) => item.value === reason)?.label ?? reason
  );
}

export function isBrandReportReason(value: string): value is BrandReportReason {
  return BRAND_REPORT_REASONS.some((item) => item.value === value);
}

export function validateBrandReportAttachment(file: File): string | null {
  if (
    !BRAND_REPORT_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof BRAND_REPORT_ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return `${file.name}: only JPG, PNG, and PDF files are supported.`;
  }
  if (file.size > BRAND_REPORT_MAX_ATTACHMENT_BYTES) {
    return `${file.name}: file must be 10 MB or smaller.`;
  }
  return null;
}
