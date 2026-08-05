import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** One Supabase client + auth lookup per request (dedupes parallel profile fetches). */
export const getRequestSupabaseSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
});
