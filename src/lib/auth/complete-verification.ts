import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AFFILIATE_DASHBOARD_PATH } from "@/lib/affiliate/paths";
import { getAccountTypeFromMetadata } from "@/lib/auth";
import { sendMemberFreeTrialStartedEmail } from "@/lib/email-templates/dispatch";
import {
  MEMBER_HOME_PATH,
  SIGNUP_MEMBERSHIP_PATH,
} from "@/lib/member/paths";
import { startMemberTrial } from "@/lib/member/start-trial";
import { upsertMemberSignupProfile } from "@/lib/member/upsert-signup-profile";
import {
  fetchMemberBillingRows,
  pickCanonicalMemberRow,
} from "@/lib/member/member-record";
import {
  isActiveMemberRow,
  isFreeTrialMemberRow,
} from "@/lib/member/membership-status";
import {
  PARTNER_APPLICATION_PATH,
} from "@/lib/partner-auth";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = ""
) {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : fallback;
}

async function registerAffiliateProfileWithSession(
  supabase: SupabaseClient,
  user: User
) {
  const metadata = user.user_metadata ?? {};
  const { error } = await supabase.rpc("register_affiliate", {
    p_first_name: readMetadataString(metadata, "first_name", "Affiliate"),
    p_last_name: readMetadataString(metadata, "last_name", "Account"),
    p_email: user.email ?? "",
    p_country: readMetadataString(metadata, "country", "New Zealand"),
    p_payment_country: readMetadataString(metadata, "country", "New Zealand"),
    p_bank_account_name: null,
    p_bank_account_number: null,
    p_tax_number: null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function completeSignupVerification(
  supabase: SupabaseClient,
  user: User
): Promise<{ redirectPath: string; error?: string }> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const accountType = getAccountTypeFromMetadata(metadata);
  const signupCompletedAt = readMetadataString(metadata, "signup_completed_at");

  if (signupCompletedAt) {
    if (accountType === "member") {
      const rows = await fetchMemberBillingRows(supabase, user.id);
      const member = pickCanonicalMemberRow(rows);
      if (
        member &&
        (isFreeTrialMemberRow(member) || isActiveMemberRow(member))
      ) {
        const signupMode = readMetadataString(metadata, "signup_mode", "trial");
        return {
          redirectPath:
            signupMode === "membership"
              ? SIGNUP_MEMBERSHIP_PATH
              : MEMBER_HOME_PATH,
        };
      }
    } else if (accountType === "partner") {
      return { redirectPath: PARTNER_APPLICATION_PATH };
    } else if (accountType === "affiliate") {
      return { redirectPath: AFFILIATE_DASHBOARD_PATH };
    }
  }

  if (accountType === "member") {
    const signupMode = readMetadataString(metadata, "signup_mode", "trial");
    const firstName = readMetadataString(metadata, "first_name", "Member");
    const lastName = readMetadataString(metadata, "last_name", "");
    const country = readMetadataString(metadata, "country", "New Zealand");
    const marketingOptIn = metadata.marketing_opt_in === true;

    if (signupMode === "membership") {
      const { error: profileError } = await upsertMemberSignupProfile(supabase, {
        authUserId: user.id,
        email: user.email ?? "",
        firstName,
        lastName,
        country,
        marketingOptIn,
      });

      if (profileError) {
        return { redirectPath: SIGNUP_MEMBERSHIP_PATH, error: profileError };
      }

      await supabase.auth.updateUser({
        data: {
          account_type: "member",
          signup_completed_at: new Date().toISOString(),
        },
      });

      return { redirectPath: SIGNUP_MEMBERSHIP_PATH };
    }

    const { error: trialError } = await startMemberTrial(supabase, {
      authUserId: user.id,
      email: user.email ?? "",
      firstName,
      lastName,
      country,
      marketingOptIn,
    });

    if (trialError) {
      return { redirectPath: MEMBER_HOME_PATH, error: trialError };
    }

    void sendMemberFreeTrialStartedEmail({
      to: user.email ?? "",
      firstName,
    }).catch((emailError) => {
      console.error("[auth/confirm] Failed to send trial started email", {
        email: user.email,
        error: emailError instanceof Error ? emailError.message : emailError,
      });
    });

    await supabase.auth.updateUser({
      data: {
        account_type: "member",
        signup_completed_at: new Date().toISOString(),
      },
    });

    return { redirectPath: MEMBER_HOME_PATH };
  }

  if (accountType === "partner") {
    await supabase.auth.updateUser({
      data: {
        account_type: "partner",
        partner_account_created: true,
        onboarding_step: 2,
        signup_completed_at: new Date().toISOString(),
      },
    });

    return { redirectPath: PARTNER_APPLICATION_PATH };
  }

  if (accountType === "affiliate") {
    try {
      await registerAffiliateProfileWithSession(supabase, user);
    } catch (error) {
      return {
        redirectPath: AFFILIATE_DASHBOARD_PATH,
        error:
          error instanceof Error
            ? error.message
            : "Account verified but affiliate profile setup failed.",
      };
    }

    await supabase.auth.updateUser({
      data: {
        account_type: "affiliate",
        affiliate_account_created: true,
        signup_completed_at: new Date().toISOString(),
      },
    });

    return { redirectPath: AFFILIATE_DASHBOARD_PATH };
  }

  return { redirectPath: MEMBER_HOME_PATH };
}
