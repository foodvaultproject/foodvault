import type { PartnerContactRow } from "@/lib/admin/types";

export const PARTNER_CONTACT_EXPORT_HEADERS = [
  "Business Name",
  "Contact Name",
  "Customer Support Email",
  "Support Phone",
  "Status",
] as const;

export function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function partnerContactExportRows(contacts: PartnerContactRow[]) {
  return contacts.map((row) => [
    row.business_name ?? "",
    row.contact_name ?? "",
    row.support_email ?? "",
    row.support_phone ?? "",
    row.status ?? "",
  ]);
}

export function buildPartnerContactsCsv(contacts: PartnerContactRow[]) {
  const lines = [
    PARTNER_CONTACT_EXPORT_HEADERS.join(","),
    ...partnerContactExportRows(contacts).map((row) => row.map(csvEscape).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export function buildPartnerContactsExcelHtml(contacts: PartnerContactRow[]) {
  const headerCells = PARTNER_CONTACT_EXPORT_HEADERS.map(
    (label) => `<th>${escapeHtml(label)}</th>`
  ).join("");
  const bodyRows = partnerContactExportRows(contacts)
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
