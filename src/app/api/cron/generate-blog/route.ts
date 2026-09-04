import { NextRequest, NextResponse } from "next/server";
import { recordScheduledJobRun } from "@/lib/audit-service";
import {
  buildBlogGenerationPayload,
  logBlogGenerationPayload,
} from "@/lib/cron/generate-blog";
import { generateBlogDraftWithGemini } from "@/lib/cron/generate-blog-gemini";
import { saveGeneratedDiscoverArticle } from "@/lib/cron/save-generated-blog";
import { revalidatePublicDiscover } from "@/lib/cache/revalidate";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

function authorizeCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client unavailable" }, { status: 503 });
  }

  try {
    const payload = await buildBlogGenerationPayload(admin);
    logBlogGenerationPayload(payload);

    const draft = await generateBlogDraftWithGemini(payload);
    const post = await saveGeneratedDiscoverArticle(admin, payload, draft);
    revalidatePublicDiscover({ slug: post.slug });

    await recordScheduledJobRun({
      jobName: "generate_blog",
      status: "success",
      result: {
        title: post.title,
        slug: post.slug,
        category: post.category,
        rotationCategory: payload.category,
      },
    });

    return NextResponse.json(
      {
        success: true,
        post: {
          title: post.title,
          slug: post.slug,
          category: payload.category === "savings" ? "saving" : payload.category,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blog cron failed";
    await recordScheduledJobRun({
      jobName: "generate_blog",
      status: "failed",
      errorMessage: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
