import { NextRequest, NextResponse } from "next/server";
import { recordScheduledJobRun } from "@/lib/audit-service";
import { CRON_EMAIL_BATCH_LIMIT } from "@/lib/cron/constants";
import { processPendingNotifications } from "@/lib/notification-service/engine";
import { approveExpiredCommissions } from "@/lib/store-integration/engine";

export const maxDuration = 30;

function authorizeCron(request: NextRequest) {
  const secret = process.env.NOTIFICATION_CRON_SECRET ?? process.env.CRON_SECRET ?? "";
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const approved = await approveExpiredCommissions();
    await recordScheduledJobRun({
      jobName: "approve_commissions",
      status: "success",
      result: { approved },
    });

    const processed = await processPendingNotifications(CRON_EMAIL_BATCH_LIMIT);
    await recordScheduledJobRun({
      jobName: "process_notifications",
      status: "success",
      result: { processed },
    });

    return NextResponse.json({ ok: true, approved, processed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification cron failed";
    await recordScheduledJobRun({
      jobName: "process_notifications",
      status: "failed",
      errorMessage: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
