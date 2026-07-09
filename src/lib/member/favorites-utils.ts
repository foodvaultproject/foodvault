export function partnerProfileSlug(businessName: string) {
  return businessName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function partnerProfilePath(businessName: string) {
  return partnerProfilePathFromSlug(partnerProfileSlug(businessName));
}

export function partnerProfilePathFromSlug(slug: string) {
  const normalized = slug.trim().toLowerCase().replace(/^-+|-+$/g, "");
  return `/brands/${normalized || "brand"}`;
}

export function formatPartnerDiscountLabel(partner: {
  discount_value?: string | null;
  offer_type?: string | null;
}) {
  const value = partner.discount_value?.trim();
  if (!value) return "Exclusive Member Offer";

  if (value.includes("%")) {
    return value;
  }

  const isPercent = partner.offer_type?.toLowerCase().includes("percent") ?? false;
  const numberMatch = value.match(/^(\d+(?:\.\d+)?)(?:\s+(.*))?$/);

  if (isPercent && numberMatch) {
    const [, number, rest] = numberMatch;
    const suffix = rest?.trim() || "Off Storewide";
    return `${number}% ${suffix}`;
  }

  if (isPercent) {
    return `${value}% Off Storewide`;
  }

  return `${value} Off Storewide`;
}

export function parseDiscountSortValue(label: string) {
  const match = label.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}
