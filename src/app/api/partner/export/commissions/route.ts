import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner) {
    return NextResponse.json({ error: "Partner account required" }, { status: 403 });
  }

  const { data, error } = await supabase.rpc("get_partner_commission_export", {
    p_partner_id: partner.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const header = [
    "Date",
    "Affiliate First Name",
    "Affiliate Last Name",
    "Affiliate Email",
    "Gross Sale",
    "Commission",
    "Currency",
    "Status",
    "Approved At",
    "Paid At",
  ];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        csvEscape(row.created_at),
        csvEscape(row.first_name),
        csvEscape(row.last_name),
        csvEscape(row.email),
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
      "Content-Disposition": 'attachment; filename="partner-commissions.csv"',
    },
  });
}
