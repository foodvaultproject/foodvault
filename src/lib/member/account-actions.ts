"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured, LOGIN_PATH, signOut } from "@/lib/auth";
import { memberUserFilter, requireAuthenticatedMember } from "@/lib/member/auth";
import { updateMemberRowsForUser } from "@/lib/member/member-record";
import { createClient } from "@/lib/supabase/server";

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
  await requireAuthenticatedMember();

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  const supabase = await createClient();
  const { error: rpcError } = await supabase.rpc("mark_membership_cancelled");

  if (!rpcError) {
    return { success: true as const };
  }

  const member = await requireAuthenticatedMember();
  const { error } = await memberUserFilter(
    supabase.from("members").update({
      membership_status: "cancelled",
      status: "CANCELLED",
      subscription_status: "CANCELLED",
    }),
    member.id
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true as const };
}

