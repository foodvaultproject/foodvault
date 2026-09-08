"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, logAuditAction } from "@/lib/admin/auth";
import {
  applyStockDelta,
  productWritePayload,
  writeInventoryBatch,
  writeProductRow,
} from "@/lib/admin/pantry";
import {
  emptyNipMatrix,
  factsFromNip,
  type NipMatrix,
  type NipNutrientKey,
} from "@/lib/admin/pantry-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
import { slugifyTitle } from "@/lib/admin/types";

function revalidatePantry() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/pantry");
  revalidatePath("/admin/pantry/reports");
  revalidatePath("/pantry");
}

function readNumber(formData: FormData, key: string): number {
  const value = Number(String(formData.get(key) ?? "").trim());
  return Number.isFinite(value) ? value : 0;
}

function readNip(formData: FormData): NipMatrix {
  const nip = emptyNipMatrix();
  nip.serving_size = String(formData.get("serving_size") ?? "").trim();
  nip.servings_per_pack = String(formData.get("servings_per_pack") ?? "").trim();
  const keys: NipNutrientKey[] = [
    "energy_kj",
    "energy_kcal",
    "protein",
    "fat_total",
    "fat_saturated",
    "carbs",
    "sugars",
    "sodium",
  ];
  for (const key of keys) {
    nip.values[key] = {
      per_serve: String(formData.get(`${key}_per_serve`) ?? "").trim(),
      per_100g: String(formData.get(`${key}_per_100g`) ?? "").trim(),
    };
  }
  return nip;
}

export async function saveVaultMarketProductAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  if (!name || !sku) return { error: "Product name and SKU are required." };

  const healthRaw = String(formData.get("health_star_rating") ?? "").trim();
  const health = healthRaw ? Number(healthRaw) : null;
  const gallery = String(formData.get("gallery_urls") ?? "")
    .split(/\r?\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);

  const payload = productWritePayload({
    id: String(formData.get("id") ?? "").trim() || undefined,
    sku,
    name,
    brand: String(formData.get("brand") ?? "").trim() || "FoodVault",
    category: String(formData.get("category") ?? "").trim() || "Pantry",
    subcategory: String(formData.get("subcategory") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim() || slugifyTitle(name),
    retail_price: readNumber(formData, "retail_price"),
    member_price: readNumber(formData, "member_price"),
    unit_price_label: String(formData.get("unit_price_label") ?? "").trim(),
    origin_label: String(formData.get("origin_label") ?? "").trim(),
    health_star_rating:
      health != null && Number.isFinite(health) && health >= 1 && health <= 5
        ? health
        : null,
    natural_flavours_or_colours: formData.get("natural_flavours_or_colours") === "on",
    description: String(formData.get("description") ?? "").trim(),
    ingredients: String(formData.get("ingredients") ?? "").trim(),
    allergens: String(formData.get("allergens") ?? "").trim(),
    nutrition_facts: factsFromNip(readNip(formData)),
    image_url: String(formData.get("image_url") ?? "").trim(),
    gallery_urls: gallery,
    is_active: formData.get("is_active") === "on",
    bin_location: String(formData.get("bin_location") ?? "").trim(),
    barcode: String(formData.get("barcode") ?? "").trim(),
    vendor_id: String(formData.get("vendor_id") ?? "").trim(),
    wholesale_cost: readNumber(formData, "wholesale_cost"),
  });

  const result = await writeProductRow(payload);
  if (result.error) return { error: result.error };

  await logAuditAction(
    payload.id ? "update_vault_market_product" : "create_vault_market_product",
    "foodvault_product",
    result.data?.id,
    { sku }
  );
  revalidatePantry();
  return { success: true, id: result.data?.id ?? null };
}

export async function saveInventoryBatchAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const productId = String(formData.get("product_id") ?? "").trim();
  const batchNumber = String(formData.get("batch_number") ?? "").trim();
  const quantity = Math.trunc(readNumber(formData, "quantity_received"));
  if (!productId) return { error: "Select a product." };
  if (!batchNumber) return { error: "Batch number is required." };
  if (quantity < 1) return { error: "Quantity received must be at least 1." };

  const expiryRaw = String(formData.get("expiry_date") ?? "").trim();
  const result = await writeInventoryBatch({
    id: String(formData.get("id") ?? "").trim() || undefined,
    product_id: productId,
    quantity_received: quantity,
    unit_cost_price: readNumber(formData, "unit_cost_price"),
    batch_number: batchNumber,
    expiry_date: expiryRaw || null,
  });

  if (result.error) return { error: result.error };

  const delta = quantity - result.previousQty;
  const stockError = await applyStockDelta(productId, delta);
  if (stockError) return { error: stockError };

  await logAuditAction(
    result.previousQty ? "update_inventory_batch" : "create_inventory_batch",
    "foodvault_inventory_batch",
    result.data?.id,
    { productId, quantity, delta }
  );
  revalidatePantry();
  return { success: true };
}

export async function uploadVaultMarketImageAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const supabase = createAdminClient() ?? (await createClient());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `vault-market/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("article-images").upload(path, file, {
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("article-images").getPublicUrl(path);
  return { url: data.publicUrl };
}
