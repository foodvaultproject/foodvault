"use server";

import {
  parseSavedDelivery,
  STOCKUP_DELIVERY_METADATA_KEY,
  type SavedDeliveryDetails,
} from "@/lib/commerce/saved-delivery";
import { createClient } from "@/lib/supabase/server";

export type CheckoutAccountDefaults = {
  loggedIn: boolean;
  email: string;
  fullName: string;
  saved: SavedDeliveryDetails | null;
};

function metadataName(metadata: Record<string, unknown>) {
  const firstName = readName(metadata.first_name);
  const lastName = readName(metadata.last_name);
  const fullName = readName(metadata.full_name);
  return [firstName, lastName].filter(Boolean).join(" ") || fullName;
}

function readName(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function getCheckoutAccountDefaults(): Promise<CheckoutAccountDefaults> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { loggedIn: false, email: "", fullName: "", saved: null };
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    loggedIn: true,
    email: user.email?.trim() ?? "",
    fullName: metadataName(metadata),
    saved: parseSavedDelivery(metadata[STOCKUP_DELIVERY_METADATA_KEY]),
  };
}

export async function saveCheckoutDeliveryAction(details: SavedDeliveryDetails) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const };

  const payload: SavedDeliveryDetails = {
    fullName: details.fullName.trim(),
    phone: details.phone.trim(),
    email: details.email.trim(),
    street: details.street.trim(),
    suburb: details.suburb.trim(),
    city: details.city.trim(),
    postcode: details.postcode.trim(),
    deliveryNotes: details.deliveryNotes.trim(),
  };

  const { error } = await supabase.auth.updateUser({
    data: { [STOCKUP_DELIVERY_METADATA_KEY]: payload },
  });

  if (error) {
    console.error("[checkout] Could not save delivery details", error.message);
    return { saved: false as const };
  }

  return { saved: true as const };
}

export async function clearCheckoutDeliveryAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { cleared: false as const };

  const { error } = await supabase.auth.updateUser({
    data: { [STOCKUP_DELIVERY_METADATA_KEY]: null },
  });

  if (error) {
    console.error("[checkout] Could not clear delivery details", error.message);
    return { cleared: false as const };
  }

  return { cleared: true as const };
}
