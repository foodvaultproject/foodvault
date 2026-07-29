import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin/auth";
import {
  buildPartnerContactsCsv,
  buildPartnerContactsExcelHtml,
} from "@/lib/admin/partner-contacts-export";
import { getPartnerContacts } from "@/lib/admin/queries";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "excel" ? "excel" : "csv";
  const search = searchParams.get("q")?.trim() || undefined;

  const contacts = await getPartnerContacts(search);

  if (format === "excel") {
    return new NextResponse(buildPartnerContactsExcelHtml(contacts), {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": 'attachment; filename="partner-contacts.xls"',
      },
    });
  }

  return new NextResponse(buildPartnerContactsCsv(contacts), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="partner-contacts.csv"',
    },
  });
}
