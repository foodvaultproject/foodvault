import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processOpenPartnerInvoices, processOpenPayoutBatch } from "@/lib/payment-service/engine";
import { queueNotification } from "@/lib/notification-service/engine";
import { recordScheduledJobRun } from "@/lib/audit-service";

function authorizeCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.PAYMENT_CRON_SECRET ?? "";
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client unavailable" }, { status: 503 });
  }

  try {
    const periodEnd = new Date();

    await admin.rpc("generate_partner_commission_invoices", {
      p_period_end: periodEnd.toISOString(),
    });

    const { data: openInvoices } = await admin
      .from("billing_invoices")
      .select("id, partner_id, gross_commission, currency")
      .eq("status", "open");

    for (const invoice of openInvoices ?? []) {
      await queueNotification({
        eventType: "INVOICE_GENERATED",
        partnerId: String(invoice.partner_id),
        payload: {
          invoice_id: invoice.id,
          amount: invoice.gross_commission,
          currency: invoice.currency,
        },
      });
    }

    await processOpenPartnerInvoices();

    const { data: batchId } = await admin.rpc("generate_affiliate_payout_batch", {
      p_period_end: periodEnd.toISOString(),
    });

    if (batchId) {
      await processOpenPayoutBatch(String(batchId));
    }

    await recordScheduledJobRun({
      jobName: "monthly_billing",
      status: "success",
      result: { invoices: openInvoices?.length ?? 0 },
    });
    await recordScheduledJobRun({
      jobName: "monthly_payouts",
      status: "success",
      result: { batchId: batchId ?? null },
    });

    return NextResponse.json({ ok: true, batchId: batchId ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Monthly cron failed";
    await recordScheduledJobRun({
      jobName: "monthly_billing",
      status: "failed",
      errorMessage: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
