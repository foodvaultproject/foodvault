import { isSupabaseConfigured } from "@/lib/auth";
import { formatBusinessName } from "@/lib/business-name";
import { partnerProfileSlug } from "@/lib/member/favorites-utils";
import { createClient } from "@/lib/supabase/server";
import {
  getVaultDropCountdownParts,
  parseVaultDropStored,
  type VaultDropProductStored,
} from "@/lib/vault-drop";

export type PublicVaultDrop = VaultDropProductStored & {
  partnerId: string;
  brandName: string;
  brandSlug: string;
  countdown_end_time: string | null;
};

function isMissingVaultDropColumnError(message: string | undefined): boolean {
  if (!message) return false;
  return (
    message.includes("vault_drop") ||
    message.includes("Could not find the") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}

function mapPublicVaultDrops(row: Record<string, unknown>): PublicVaultDrop[] {
  const vaultDrop = parseVaultDropStored(row.vault_drop);
  if (!vaultDrop || vaultDrop.products.length === 0) return [];

  const countdown = getVaultDropCountdownParts(vaultDrop.countdown_end_time);
  if (countdown.expired) return [];

  const businessName =
    typeof row.business_name === "string" ? formatBusinessName(row.business_name) : "Brand";
  const slug =
    typeof row.slug === "string" && row.slug.trim()
      ? row.slug.trim()
      : partnerProfileSlug(businessName);

  return vaultDrop.products.map((product) => ({
    ...product,
    partnerId: String(row.id),
    brandName: businessName,
    brandSlug: slug,
    countdown_end_time: vaultDrop.countdown_end_time,
  }));
}

function developmentPreviewVaultDrops(): PublicVaultDrop[] {
  if (process.env.NODE_ENV !== "development") {
    return [];
  }

  const end = new Date();
  end.setDate(end.getDate() + 3);

  return [
    {
      partnerId: "dev-vault-drop-preview",
      brandName: "Preview Brand Co.",
      brandSlug: "preview-brand-co",
      title: "Surplus Protein Bars Vault Clearance",
      description: "Short-dated stock clearance for FoodVault members only.",
      image_urls: [
        "/for-brands/promote-exclusive-offers.png",
        "/for-brands/sell-direct.png",
      ],
      original_price: 59.99,
      clearance_price: 38.99,
      discount_percentage: 35,
      reason_tag: "Surplus / Overstock",
      direct_store_link: "https://example.com/vault-drop",
      countdown_end_time: end.toISOString(),
    },
  ];
}

export async function getActiveVaultDrops(limit = 12): Promise<PublicVaultDrop[]> {
  if (!isSupabaseConfigured()) {
    return developmentPreviewVaultDrops().slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, business_name, slug, vault_drop, listing_status_v2")
    .not("vault_drop", "is", null)
    .eq("listing_status_v2", "LIVE")
    .limit(Math.max(limit * 3, 24));

  if (error) {
    if (isMissingVaultDropColumnError(error.message)) {
      return developmentPreviewVaultDrops().slice(0, limit);
    }
    console.error("[vault-drop] Failed to load active drops:", error.message);
    return developmentPreviewVaultDrops().slice(0, limit);
  }

  const drops = (data ?? [])
    .flatMap((row) => mapPublicVaultDrops(row as Record<string, unknown>))
    .slice(0, limit);

  if (drops.length === 0) {
    return developmentPreviewVaultDrops().slice(0, limit);
  }

  return drops;
}
