import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const productId = String(body.product_id ?? "").trim();
  const source = String(body.source ?? "view").trim() === "search" ? "search" : "view";
  if (!productId) {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  }

  const { error } = await admin.from("foodvault_lost_sales").insert({
    product_id: productId,
    sku: String(body.sku ?? "").trim() || null,
    name: String(body.name ?? "").trim() || null,
    source,
    search_query: String(body.search_query ?? "").trim() || null,
    estimated_revenue: Number.isFinite(Number(body.estimated_revenue))
      ? Number(body.estimated_revenue)
      : 0,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
