export const FREE_SHIPPING_THRESHOLD_NZD = 100;
export const STANDARD_SHIPPING_NZD = 9.95;

export type VaultMarketDeliveryDetails = {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  suburb: string;
  city: string;
  postcode: string;
  deliveryNotes: string;
};

export function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

export function vaultMarketFreight(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD_NZD ? 0 : STANDARD_SHIPPING_NZD;
}

export function amountToFreeShipping(subtotal: number) {
  return roundCents(Math.max(0, FREE_SHIPPING_THRESHOLD_NZD - subtotal));
}

export function qualifiesForFreeShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD_NZD;
}

function requiredText(raw: unknown, label: string) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) {
    throw new Error(`${label} is required`);
  }
  return value;
}

export function formatDeliveryAddress(details: Pick<
  VaultMarketDeliveryDetails,
  "street" | "suburb" | "city" | "postcode"
>) {
  return [details.street, details.suburb, `${details.city} ${details.postcode}`.trim()]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function parseVaultMarketDelivery(raw: unknown): VaultMarketDeliveryDetails {
  if (!raw || typeof raw !== "object") {
    throw new Error("Delivery details are required");
  }

  const input = raw as Record<string, unknown>;
  const fullName = requiredText(input.fullName ?? input.name, "Full name");
  const phone = requiredText(input.phone, "Phone number");
  const email = requiredText(input.email, "Email address").toLowerCase();
  const street = requiredText(input.street, "Street address");
  const suburb = requiredText(input.suburb, "Suburb");
  const city = requiredText(input.city, "City");
  const postcode = requiredText(input.postcode, "Postcode");
  const deliveryNotes =
    typeof input.deliveryNotes === "string" ? input.deliveryNotes.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address");
  }
  if (phone.replace(/\D/g, "").length < 8) {
    throw new Error("Enter a valid phone number");
  }
  if (!/^\d{4}$/.test(postcode)) {
    throw new Error("Enter a valid 4-digit NZ postcode");
  }

  return {
    fullName,
    phone,
    email,
    street,
    suburb,
    city,
    postcode,
    deliveryNotes,
  };
}
