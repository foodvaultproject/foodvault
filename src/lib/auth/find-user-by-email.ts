import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

type AuthUserRow = {
  id: string;
  email: string | null;
  email_confirmed_at: string | null;
  user_metadata: Record<string, unknown> | null;
};

function mapAuthUserRow(row: AuthUserRow): User {
  return {
    id: row.id,
    email: row.email ?? undefined,
    email_confirmed_at: row.email_confirmed_at ?? undefined,
    user_metadata: row.user_metadata ?? {},
    app_metadata: {},
    aud: "authenticated",
    created_at: "",
  } as User;
}

export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const normalized = email.trim();
  if (!normalized) {
    return null;
  }

  const { data, error } = await admin.rpc("admin_get_auth_user_by_email", {
    p_email: normalized,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return mapAuthUserRow(data as AuthUserRow);
}
