import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type EstablishSignupSessionResult =
  | { ok: true }
  | { ok: false; needsEmailConfirmation: true; message: string };

/**
 * Supabase may require email confirmation before returning a session on signUp.
 * For member signup we auto-confirm via the admin client (when available) and
 * sign the user in server-side so cookies are set before redirecting to welcome.
 */
export async function establishMemberSignupSession(
  supabase: SupabaseClient,
  params: {
    authUserId: string;
    email: string;
    password: string;
    hasSession: boolean;
  }
): Promise<EstablishSignupSessionResult> {
  if (params.hasSession) {
    return { ok: true };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      needsEmailConfirmation: true,
      message:
        "Your account was created. Please check your email to confirm your address, then log in.",
    };
  }

  const { error: confirmError } = await admin.auth.admin.updateUserById(
    params.authUserId,
    { email_confirm: true }
  );

  if (confirmError) {
    console.error("[signup] Auto-confirm member email failed", confirmError);
    return {
      ok: false,
      needsEmailConfirmation: true,
      message:
        "Your account was created. Please check your email to confirm your address, then log in.",
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (signInError) {
    console.error("[signup] Post-confirm member sign-in failed", signInError);
    return {
      ok: false,
      needsEmailConfirmation: true,
      message: signInError.message,
    };
  }

  return { ok: true };
}
