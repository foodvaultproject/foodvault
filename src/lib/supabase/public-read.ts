import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/** Cookieless Supabase client for public directory reads (SSG/ISR safe). */
export function createAnonReadClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Prefer service role for stable public reads; fall back to anon without cookies. */
export function createPublicReadClient(): SupabaseClient | null {
  return createAdminClient() ?? createAnonReadClient();
}
