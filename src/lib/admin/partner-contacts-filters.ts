import type { PartnerContactStatus } from "@/lib/admin/types";

export type PartnerContactFilters = {
  business?: string;
  contact?: string;
  email?: string;
  phone?: string;
  status?: PartnerContactStatus;
};

export const PARTNER_CONTACT_STATUS_FILTER_OPTIONS: Array<{
  value: "" | PartnerContactStatus;
  label: string;
}> = [
  { value: "", label: "All statuses" },
  { value: "Live", label: "Live" },
  { value: "Pending Activation", label: "Pending Activation" },
];

export function parsePartnerContactFilters(
  params: Record<string, string | undefined>
): PartnerContactFilters {
  const status = params.status?.trim();
  const normalizedStatus =
    status === "Live" || status === "Pending Activation" ? status : undefined;

  return {
    business: params.business?.trim() || undefined,
    contact: params.contact?.trim() || undefined,
    email: params.email?.trim() || undefined,
    phone: params.phone?.trim() || undefined,
    status: normalizedStatus,
  };
}

export function partnerContactFiltersToSearchParams(
  filters: PartnerContactFilters
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.business) params.set("business", filters.business);
  if (filters.contact) params.set("contact", filters.contact);
  if (filters.email) params.set("email", filters.email);
  if (filters.phone) params.set("phone", filters.phone);
  if (filters.status) params.set("status", filters.status);
  return params;
}

export function partnerContactFiltersQueryString(filters: PartnerContactFilters) {
  const params = partnerContactFiltersToSearchParams(filters);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function matchesPartnerContactFilters(
  row: {
    business_name: string | null;
    contact_name: string | null;
    support_email: string | null;
    support_phone: string | null;
    status: PartnerContactStatus | null;
  },
  filters: PartnerContactFilters
) {
  const business = filters.business?.toLowerCase();
  const contact = filters.contact?.toLowerCase();
  const email = filters.email?.toLowerCase();
  const phone = filters.phone?.toLowerCase();

  if (business && !row.business_name?.toLowerCase().includes(business)) return false;
  if (contact && !row.contact_name?.toLowerCase().includes(contact)) return false;
  if (email && !row.support_email?.toLowerCase().includes(email)) return false;
  if (phone && !row.support_phone?.toLowerCase().includes(phone)) return false;
  if (filters.status && row.status !== filters.status) return false;

  return true;
}
