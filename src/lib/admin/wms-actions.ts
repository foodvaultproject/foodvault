"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, logAuditAction } from "@/lib/admin/auth";
import {
  assignProductsToVendor,
  completePurchaseOrderReceiving,
  createPurchaseOrder,
  createVendor,
  lookupProductByBarcode,
  receivePoItem,
  updateVendor,
} from "@/lib/admin/wms";

function revalidateWms(paths: string[] = []) {
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/purchase-orders");
  revalidatePath("/admin/credit-notes");
  revalidatePath("/admin/picker");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  for (const path of paths) revalidatePath(path);
}

export async function saveVendorAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Vendor name is required." };

  const payload = {
    name,
    contactName: String(formData.get("contact_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    paymentTerms: String(formData.get("payment_terms") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };
  const id = String(formData.get("id") ?? "").trim();

  if (id) {
    const error = await updateVendor(id, payload);
    if (error) return { error };
    await logAuditAction("update_vendor", "foodvault_vendor", id);
    revalidateWms([`/admin/vendors/${id}`]);
    return { success: true, id };
  }

  const result = await createVendor(payload);
  if (result.error || !result.id) return { error: result.error ?? "Failed to create vendor." };
  await logAuditAction("create_vendor", "foodvault_vendor", result.id);
  revalidateWms([`/admin/vendors/${result.id}`]);
  return { success: true, id: result.id };
}

export async function assignVendorProductsAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  const vendorId = String(formData.get("vendor_id") ?? "").trim();
  const productIds = formData.getAll("product_ids").map((value) => String(value).trim()).filter(Boolean);
  if (!vendorId) return { error: "Vendor is required." };
  const error = await assignProductsToVendor(vendorId, productIds);
  if (error) return { error };
  revalidateWms([`/admin/vendors/${vendorId}`]);
  return { success: true };
}

export async function generatePurchaseOrderAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  const vendorId = String(formData.get("vendor_id") ?? "").trim();
  if (!vendorId) return { error: "Vendor is required." };

  const lines: Array<{ productId: string; quantity: number }> = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty_")) continue;
    const productId = key.slice(4);
    const quantity = Math.max(0, Math.trunc(Number(value)));
    if (productId && quantity > 0) lines.push({ productId, quantity });
  }

  const result = await createPurchaseOrder(vendorId, lines);
  if (result.error || !result.id) return { error: result.error ?? "Failed to create purchase order." };
  await logAuditAction("create_purchase_order", "foodvault_purchase_order", result.id, {
    poNumber: result.poNumber,
  });
  revalidateWms([`/admin/vendors/${vendorId}`, `/admin/purchase-orders/${result.id}`]);
  return { success: true, id: result.id, poNumber: result.poNumber };
}

export async function receivePoItemAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const itemId = String(formData.get("item_id") ?? "").trim();
  const poId = String(formData.get("po_id") ?? "").trim();
  if (!itemId) return { error: "PO line is required." };

  const error = await receivePoItem({
    itemId,
    quantityReceived: Math.max(0, Math.trunc(Number(formData.get("quantity_received") ?? 0))),
    batchNumber: String(formData.get("batch_number") ?? "").trim(),
    expiryDate: String(formData.get("expiry_date") ?? "").trim(),
    discrepancyReason: String(formData.get("discrepancy_reason") ?? "").trim() || null,
  });
  if (error) return { error };
  revalidateWms([`/admin/picker/receive/${poId}`, `/admin/purchase-orders/${poId}`]);
  return { success: true };
}

export async function completeReceivingAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  const poId = String(formData.get("po_id") ?? "").trim();
  if (!poId) return { error: "Purchase order is required." };

  const result = await completePurchaseOrderReceiving(poId);
  if (result.error) return { error: result.error };
  await logAuditAction("receive_purchase_order", "foodvault_purchase_order", poId, {
    creditNoteId: result.creditNoteId,
  });
  revalidateWms([
    `/admin/picker/receive/${poId}`,
    `/admin/purchase-orders/${poId}`,
    result.creditNoteId ? `/admin/credit-notes/${result.creditNoteId}` : "/admin/credit-notes",
  ]);
  return { success: true, creditNoteId: result.creditNoteId };
}

export async function lookupProductScanAction(code: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized", product: null };
  const product = await lookupProductByBarcode(code);
  if (!product) return { error: "No product matches that barcode.", product: null };
  return { error: null, product };
}
