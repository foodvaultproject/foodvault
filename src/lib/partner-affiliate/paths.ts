export const PARTNER_AFFILIATE_PROGRAM_PATH = "/partner/affiliate-program";

export type PartnerAffiliateTab =
  | "overview"
  | "affiliates"
  | "analytics"
  | "links"
  | "orders"
  | "integration"
  | "billing";

export const PARTNER_AFFILIATE_TABS: { id: PartnerAffiliateTab; label: string }[] = [
  { id: "overview", label: "Program Status" },
  { id: "affiliates", label: "Affiliates" },
  { id: "orders", label: "Affiliate Orders" },
  { id: "analytics", label: "Analytics" },
  { id: "links", label: "Links" },
  { id: "integration", label: "Store Integration" },
  { id: "billing", label: "Billing" },
];

export function parsePartnerAffiliateTab(value: string | null | undefined): PartnerAffiliateTab {
  if (
    value === "affiliates" ||
    value === "analytics" ||
    value === "links" ||
    value === "orders" ||
    value === "integration" ||
    value === "billing"
  ) {
    return value;
  }
  return "overview";
}
