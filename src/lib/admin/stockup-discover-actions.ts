"use server";

import { getAdminUser } from "@/lib/admin/auth";
import { revalidatePublicDiscover } from "@/lib/cache/revalidate";
import { generateAndSaveStockUpArticle } from "@/lib/cron/generate-stockup-blog";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateStockUpDraftAction() {
  const adminUser = await getAdminUser();
  if (!adminUser) return { error: "Unauthorized" };

  const admin = createAdminClient();
  if (!admin) return { error: "Article generation is not configured." };

  try {
    const post = await generateAndSaveStockUpArticle(admin, { publish: false });
    revalidatePublicDiscover({ slug: post.slug, site: "stockup" });
    return { id: post.id as string };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not generate a draft." };
  }
}
