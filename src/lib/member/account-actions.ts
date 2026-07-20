"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured, LOGIN_PATH, signOut } from "@/lib/auth";
import { memberUserFilter, requireAuthenticatedMember } from "@/lib/member/auth";
import { updateMemberRowsForUser } from "@/lib/member/member-record";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import {
  cancelMemberStripeSubscription,
  cancelMemberStripeSubscriptionImmediately,
} from "@/lib/payment-service/providers/stripe-member";
import { createClient } from "@/lib/supabase/server";
import { formatMemberDateShort } from "@/lib/member/format";

export type ProfileFormData = {
  firstName: string;
  lastName: string;
  country: string;
};

export async function updateMemberProfileAction(data: ProfileFormData) {
  const member = await requireAuthenticatedMember();

  if (!data.firstName.trim() || !data.lastName.trim()) {
    return { error: "First name and last name are required." };
  }

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const { error } = await updateMemberRowsForUser(member.id, member.email, {
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    country: data.country,
    location: data.country,
  });

  if (error) {
    return { error };
  }

  const supabase = await createClient();
  await supabase.auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName,
    },
  });

  return { success: true as const };
}

export async function deleteMemberAccountAction() {
  const member = await requireAuthenticatedMember();

  if (!isSupabaseConfigured()) {
    await signOut();
    redirect(LOGIN_PATH);
  }

  // Stop Stripe billing before soft-deleting the FoodVault account.
  if (getPaymentServiceConfig().isConfigured) {
    try {
      await cancelMemberStripeSubscriptionImmediately(member.id);
    } catch (error) {
      console.error("[account] Failed to cancel Stripe subscription on delete", {
        authUserId: member.id,
        error: error instanceof Error ? error.message : error,
      });
      return {
        error:
          "We couldn't cancel your Stripe subscription before deleting the account. Please try again or contact support.",
      };
    }
  }

  const supabase = await createClient();
  const { error: rpcError } = await supabase.rpc("soft_delete_member_account");

  if (rpcError) {
    const { error } = await memberUserFilter(
      supabase.from("members").update({ deleted_at: new Date().toISOString() }),
      member.id
    );

    if (error) {
      return { error: error.message };
    }
  }

  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}

export async function endTrialEarlyAction() {
  await requireAuthenticatedMember();

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  const supabase = await createClient();
  const { error: rpcError } = await supabase.rpc("end_member_trial_early");

  if (!rpcError) {
    return { success: true as const };
  }

  const member = await requireAuthenticatedMember();
  const { error } = await memberUserFilter(
    supabase.from("members").update({
      membership_status: "expired",
      status: "EXPIRED",
      subscription_status: "EXPIRED",
      trial_ends_at: new Date().toISOString(),
    }),
    member.id
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true as const };
}

export async function cancelMembershipAction() {
  const member = await requireAuthenticatedMember();

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  if (!getPaymentServiceConfig().isConfigured) {
    return {
      error:
        "Billing is not configured right now. Please try again later or contact support.",
    };
  }

  try {
    // Stripe is the source of truth. FoodVault access stays active until the
    // subscription period ends and webhooks/sync revoke paid access.
    const result = await cancelMemberStripeSubscription(member.id);
    const until = result.accessUntil
      ? formatMemberDateShort(result.accessUntil)
      : "the end of your current billing period";

    if (result.status === "already_canceled") {
      return {
        success: true as const,
        message: "Your membership is already cancelled.",
      };
    }

    if (result.status === "already_scheduled") {
      return {
        success: true as const,
        message: `Your cancellation is already scheduled. You'll keep access until ${until}, and you won't be charged again.`,
      };
    }

    return {
      success: true as const,
      message: `Your membership will remain active until ${until}. You won't be charged again.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to cancel your membership. Please try again or use Manage Billing.",
    };
  }
}

