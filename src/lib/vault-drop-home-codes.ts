import { createAdminClient } from "@/lib/supabase/admin";
import { formatBusinessNameOrNull } from "@/lib/business-name";
import type { CodeAccessState } from "@/lib/member/partner-profile";
import { memberHasActiveAccess } from "@/lib/member/member-record";
import { resolvePartnerVaultDropCode } from "@/lib/partner-data";
import { createClient } from "@/lib/supabase/server";

function isPartnerAccount(user: { user_metadata?: Record<string, unknown> }) {
  return user.user_metadata?.account_type === "partner";
}

async function userHasPartnerRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

async function resolveLockedCodeState(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; user_metadata?: Record<string, unknown> } | null
): Promise<CodeAccessState> {
  if (!user) {
    return "anon";
  }

  if (isPartnerAccount(user) || (await userHasPartnerRecord(supabase, user.id))) {
    return "partner-other";
  }

  return "member-required";
}

export async function resolveHomeVaultDropCodesByPartner(
  partnerIds: string[]
): Promise<Map<string, { code: string | null; state: CodeAccessState }>> {
  const result = new Map<string, { code: string | null; state: CodeAccessState }>();

  if (partnerIds.length === 0) {
    return result;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: batchRows, error } = await supabase.rpc(
    "get_partner_vault_drop_codes_batch",
    { p_partner_ids: partnerIds }
  );

  if (error) {
    console.error("[vault-drop] Batch code lookup failed:", error.message);
  }

  const codeByPartner = new Map<string, string | null>();
  for (const row of batchRows ?? []) {
    const partnerId = String((row as { partner_id: string }).partner_id);
    const code = (row as { flash_sale_code: string | null }).flash_sale_code;
    codeByPartner.set(partnerId, code ? String(code) : null);
  }

  const lockedState = await resolveLockedCodeState(supabase, user);

  const ownedPartnerIds: string[] = [];
  const ownedPartnerNames = new Map<string, string | null>();

  if (user) {
    const { data: ownedPartners } = await supabase
      .from("partners")
      .select("id, business_name, user_id")
      .in("id", partnerIds)
      .eq("user_id", user.id);

    for (const partner of ownedPartners ?? []) {
      const partnerId = String(partner.id);
      ownedPartnerNames.set(
        partnerId,
        formatBusinessNameOrNull(partner.business_name as string | null)
      );
      if (!codeByPartner.get(partnerId)) {
        ownedPartnerIds.push(partnerId);
      }
    }
  }

  const backfilledCodes = new Map<string, string | null>();
  if (ownedPartnerIds.length > 0 && user) {
    await Promise.all(
      ownedPartnerIds.map(async (partnerId) => {
        const resolved = await resolvePartnerVaultDropCode(
          supabase as unknown as Parameters<typeof resolvePartnerVaultDropCode>[0],
          partnerId,
          ownedPartnerNames.get(partnerId) ?? null
        );
        backfilledCodes.set(partnerId, resolved);
      })
    );
  }

  let memberFallbackCodes = new Map<string, string>();
  if (user && (await memberHasActiveAccess(user.id))) {
    const missingForMember = partnerIds.filter(
      (partnerId) => !codeByPartner.get(partnerId) && !backfilledCodes.get(partnerId)
    );

    if (missingForMember.length > 0) {
      const admin = createAdminClient();
      if (admin) {
        const { data: partners } = await admin
          .from("partners")
          .select(
            "id, vault_drop_code, user_id, application_status_v2, listing_status_v2, suspended"
          )
          .in("id", missingForMember);

        memberFallbackCodes = new Map(
          (partners ?? [])
            .filter(
              (partner) =>
                partner.vault_drop_code &&
                partner.application_status_v2 === "APPROVED" &&
                partner.listing_status_v2 === "LIVE" &&
                !partner.suspended &&
                partner.user_id !== user.id
            )
            .map((partner) => [String(partner.id), String(partner.vault_drop_code)])
        );
      }
    }
  }

  for (const partnerId of partnerIds) {
    const rpcCode = codeByPartner.get(partnerId);
    if (rpcCode) {
      result.set(partnerId, { code: rpcCode, state: "visible" });
      continue;
    }

    const backfilled = backfilledCodes.get(partnerId);
    if (backfilled) {
      result.set(partnerId, { code: backfilled, state: "visible" });
      continue;
    }

    const memberCode = memberFallbackCodes.get(partnerId);
    if (memberCode) {
      result.set(partnerId, { code: memberCode, state: "visible" });
      continue;
    }

    result.set(partnerId, { code: null, state: lockedState });
  }

  return result;
}
