export const STOCKUP_DELIVERY_METADATA_KEY = "stockup_delivery";

export type SavedDeliveryDetails = {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  suburb: string;
  city: string;
  postcode: string;
  deliveryNotes: string;
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseSavedDelivery(raw: unknown): SavedDeliveryDetails | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const details: SavedDeliveryDetails = {
    fullName: readText(input.fullName),
    phone: readText(input.phone),
    email: readText(input.email),
    street: readText(input.street),
    suburb: readText(input.suburb),
    city: readText(input.city),
    postcode: readText(input.postcode),
    deliveryNotes: readText(input.deliveryNotes),
  };
  const hasDetails = Object.values(details).some(Boolean);
  return hasDetails ? details : null;
}
