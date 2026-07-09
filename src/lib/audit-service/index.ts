import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export function hashClientIp(ip: string | null): string | null {
  if (!ip?.trim()) return null;
  const salt = process.env.REFERRAL_IP_HASH_SALT ?? process.env.CRON_SECRET ?? "foodvault";
  return createHash("sha256").update(`${salt}:${ip.trim()}`).digest("hex");
}

export function getRequestIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return request.headers.get("x-real-ip");
}

export async function logAffiliateAudit(input: {
  actorType: "system" | "partner" | "affiliate" | "admin";
  actorId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.rpc("log_affiliate_audit", {
    p_actor_type: input.actorType,
    p_actor_id: input.actorId ?? null,
    p_action: input.action,
    p_entity_type: input.entityType ?? null,
    p_entity_id: input.entityId ?? null,
    p_metadata: input.metadata ?? {},
  });

  if (error) return null;
  return data as string;
}

export async function recordScheduledJobRun(input: {
  jobName: string;
  status: "success" | "failed";
  result?: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.rpc("record_scheduled_job_run", {
    p_job_name: input.jobName,
    p_status: input.status,
    p_result: input.result ?? {},
    p_error_message: input.errorMessage ?? null,
  });
}
