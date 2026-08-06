import { createAdminClient } from "@/lib/supabase/admin";

export async function getAuthUserIdentityProviders(
  userId: string
): Promise<string[]> {
  const admin = createAdminClient();
  if (!admin) {
    return [];
  }

  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) {
    return [];
  }

  return (data.user.identities ?? []).map((identity) => identity.provider);
}

export function userHasEmailPasswordIdentity(providers: string[]): boolean {
  return providers.includes("email");
}

export function userHasGoogleIdentity(providers: string[]): boolean {
  return providers.includes("google");
}
