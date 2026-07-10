import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

type AffiliateCommissionExportRow = {
  created_at: string | null;
  brand_name: string | null;
  gross_sale: string | number | null;
  commission_value: string | number | null;
  currency: string | null;
  status: string | null;
  approved_at: string | null;
  paid_at: string | null;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate account required" }, { status: 403 });
  }

  const { data, error } = await supabase.rpc("get_affiliate_commission_export", {
    p_affiliate_id: affiliate.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as AffiliateCommissionExportRow[];
  const header = ["Date", "Brand", "Gross Sale", "Commission", "Currency", "Status", "Approved At", "Paid At"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        csvEscape(row.created_at),
        csvEscape(row.brand_name),
        csvEscape(row.gross_sale),
        csvEscape(row.commission_value),
        csvEscape(row.currency),
        csvEscape(row.status),
        csvEscape(row.approved_at),
        csvEscape(row.paid_at),
      ].join(",")
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="affiliate-commissions.csv"',
    },
  });
}
