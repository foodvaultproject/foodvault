import { isSupabaseConfigured } from "@/lib/auth";
import {
  claimValue,
  normalizeScanCode,
  type CreditNoteItem,
  type CreditNoteRecord,
  type CreditNoteStatus,
  type DiscrepancyReason,
  type ProductScanInfo,
  type PurchaseOrderItem,
  type PurchaseOrderRecord,
  type PurchaseOrderStatus,
  type VendorProductRow,
  type VendorRecord,
} from "@/lib/admin/wms-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function wmsClient() {
  return createAdminClient() ?? (isSupabaseConfigured() ? await createClient() : null);
}

function mapVendor(row: Record<string, unknown>, productCount = 0, openPoCount = 0): VendorRecord {
  return {
    id: asString(row.id),
    name: asString(row.name),
    contactName: asString(row.contact_name) || null,
    email: asString(row.email) || null,
    phone: asString(row.phone) || null,
    paymentTerms: asString(row.payment_terms) || null,
    notes: asString(row.notes) || null,
    productCount,
    openPoCount,
  };
}

function mapPoItem(row: Record<string, unknown>): PurchaseOrderItem {
  return {
    id: asString(row.id),
    poId: asString(row.po_id),
    productId: asString(row.product_id),
    sku: asString(row.sku),
    name: asString(row.name),
    barcode: asString(row.barcode) || null,
    quantityOrdered: Math.max(0, Math.trunc(asNumber(row.quantity_ordered))),
    quantityReceived: Math.max(0, Math.trunc(asNumber(row.quantity_received))),
    costPrice: asNumber(row.cost_price),
    discrepancyQty: Math.max(0, Math.trunc(asNumber(row.discrepancy_qty))),
    discrepancyReason: (asString(row.discrepancy_reason) || null) as DiscrepancyReason | null,
    batchNumber: asString(row.batch_number) || null,
    expiryDate: asString(row.expiry_date) || null,
  };
}

function mapPo(
  row: Record<string, unknown>,
  vendorName: string,
  items: PurchaseOrderItem[]
): PurchaseOrderRecord {
  return {
    id: asString(row.id),
    poNumber: asString(row.po_number),
    vendorId: asString(row.vendor_id),
    vendorName,
    status: asString(row.status, "open") as PurchaseOrderStatus,
    notes: asString(row.notes) || null,
    createdAt: asString(row.created_at),
    itemCount: items.length,
    orderedUnits: items.reduce((sum, item) => sum + item.quantityOrdered, 0),
    receivedUnits: items.reduce((sum, item) => sum + item.quantityReceived, 0),
    items,
  };
}

async function nextDocumentNumber(
  supabase: NonNullable<Awaited<ReturnType<typeof wmsClient>>>,
  table: "foodvault_purchase_orders" | "foodvault_credit_notes",
  column: "po_number" | "credit_number",
  prefix: "PO" | "CN"
) {
  const { data } = await supabase.from(table).select(column);
  let max = 1000;
  for (const row of data ?? []) {
    const value = asString((row as Record<string, unknown>)[column]);
    const match = value.match(new RegExp(`^${prefix}-(\\d+)$`, "i"));
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

export async function listVendors(): Promise<VendorRecord[]> {
  const supabase = await wmsClient();
  if (!supabase) return [];

  const [{ data: vendors, error }, { data: products }, { data: orders }] = await Promise.all([
    supabase.from("foodvault_vendors").select("*").order("name", { ascending: true }),
    supabase.from("foodvault_products").select("id, vendor_id"),
    supabase.from("foodvault_purchase_orders").select("id, vendor_id, status"),
  ]);

  if (error) {
    console.error("[wms] failed to list vendors", error.message);
    return [];
  }

  const productCounts = new Map<string, number>();
  for (const row of products ?? []) {
    const vendorId = asString((row as Record<string, unknown>).vendor_id);
    if (!vendorId) continue;
    productCounts.set(vendorId, (productCounts.get(vendorId) ?? 0) + 1);
  }

  const openCounts = new Map<string, number>();
  for (const row of orders ?? []) {
    const record = row as Record<string, unknown>;
    if (!["open", "receiving"].includes(asString(record.status))) continue;
    const vendorId = asString(record.vendor_id);
    openCounts.set(vendorId, (openCounts.get(vendorId) ?? 0) + 1);
  }

  return ((vendors ?? []) as Record<string, unknown>[]).map((row) =>
    mapVendor(row, productCounts.get(asString(row.id)) ?? 0, openCounts.get(asString(row.id)) ?? 0)
  );
}

export async function getVendor(id: string): Promise<VendorRecord | null> {
  const supabase = await wmsClient();
  if (!supabase || !id.trim()) return null;
  const { data, error } = await supabase.from("foodvault_vendors").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapVendor(data as Record<string, unknown>);
}

export async function productSalesVelocity30d(): Promise<Map<string, number>> {
  const supabase = await wmsClient();
  const velocity = new Map<string, number>();
  if (!supabase) return velocity;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: orders } = await supabase
    .from("foodvault_orders")
    .select("id")
    .in("status", ["paid", "fulfilled"])
    .gte("created_at", since);

  const orderIds = (orders ?? []).map((row) => asString((row as Record<string, unknown>).id)).filter(Boolean);
  if (orderIds.length === 0) return velocity;

  const { data: items } = await supabase
    .from("foodvault_order_items")
    .select("product_id, sku, quantity")
    .in("order_id", orderIds);

  for (const item of items ?? []) {
    const record = item as Record<string, unknown>;
    const qty = Math.max(0, Math.trunc(asNumber(record.quantity)));
    const productId = asString(record.product_id);
    const sku = asString(record.sku);
    if (productId) velocity.set(productId, (velocity.get(productId) ?? 0) + qty);
    if (sku) velocity.set(sku, (velocity.get(sku) ?? 0) + qty);
  }

  return velocity;
}

export async function listVendorProducts(vendorId: string): Promise<VendorProductRow[]> {
  const supabase = await wmsClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("foodvault_products")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("name", { ascending: true });

  if (error) {
    console.error("[wms] failed to list vendor products", error.message);
    return [];
  }

  const velocity = await productSalesVelocity30d();
  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const id = asString(row.id);
    const sku = asString(row.sku);
    return {
      id,
      sku,
      name: asString(row.name),
      barcode: asString(row.barcode) || null,
      wholesaleCost: asNumber(row.wholesale_cost),
      stockQuantity: Math.max(0, Math.trunc(asNumber(row.stock_quantity))),
      salesVelocity30d: velocity.get(id) ?? velocity.get(sku) ?? 0,
      imageUrl: asString(row.image_url) || null,
      binLocation: asString(row.bin_location) || null,
    };
  });
}

export async function listAssignableProducts(): Promise<Array<{ id: string; sku: string; name: string }>> {
  const supabase = await wmsClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("foodvault_products")
    .select("id, sku, name, vendor_id")
    .order("name", { ascending: true });
  return ((data ?? []) as Record<string, unknown>[])
    .filter((row) => !asString(row.vendor_id))
    .map((row) => ({
      id: asString(row.id),
      sku: asString(row.sku),
      name: asString(row.name),
    }));
}

export async function listPurchaseOrders(status?: PurchaseOrderStatus): Promise<PurchaseOrderRecord[]> {
  const supabase = await wmsClient();
  if (!supabase) return [];

  let query = supabase.from("foodvault_purchase_orders").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[wms] failed to list purchase orders", error.message);
    return [];
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const vendorIds = [...new Set(rows.map((row) => asString(row.vendor_id)).filter(Boolean))];
  const poIds = rows.map((row) => asString(row.id)).filter(Boolean);

  const [{ data: vendors }, { data: items }] = await Promise.all([
    vendorIds.length
      ? supabase.from("foodvault_vendors").select("id, name").in("id", vendorIds)
      : Promise.resolve({ data: [] }),
    poIds.length
      ? supabase.from("foodvault_po_items").select("*").in("po_id", poIds)
      : Promise.resolve({ data: [] }),
  ]);

  const vendorNames = new Map(
    ((vendors ?? []) as Record<string, unknown>[]).map((row) => [asString(row.id), asString(row.name)])
  );
  const itemsByPo = new Map<string, PurchaseOrderItem[]>();
  for (const item of (items ?? []) as Record<string, unknown>[]) {
    const mapped = mapPoItem(item);
    const list = itemsByPo.get(mapped.poId) ?? [];
    list.push(mapped);
    itemsByPo.set(mapped.poId, list);
  }

  return rows.map((row) =>
    mapPo(row, vendorNames.get(asString(row.vendor_id)) ?? "Vendor", itemsByPo.get(asString(row.id)) ?? [])
  );
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrderRecord | null> {
  const supabase = await wmsClient();
  if (!supabase || !id.trim()) return null;

  const { data, error } = await supabase.from("foodvault_purchase_orders").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;

  const [{ data: vendor }, { data: items }] = await Promise.all([
    supabase.from("foodvault_vendors").select("id, name").eq("id", asString(row.vendor_id)).maybeSingle(),
    supabase.from("foodvault_po_items").select("*").eq("po_id", id),
  ]);

  return mapPo(
    row,
    asString((vendor as Record<string, unknown> | null)?.name, "Vendor"),
    ((items ?? []) as Record<string, unknown>[]).map(mapPoItem)
  );
}

export async function listCreditNotes(): Promise<CreditNoteRecord[]> {
  const supabase = await wmsClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("foodvault_credit_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[wms] failed to list credit notes", error.message);
    return [];
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const vendorIds = [...new Set(rows.map((row) => asString(row.vendor_id)).filter(Boolean))];
  const poIds = [...new Set(rows.map((row) => asString(row.po_id)).filter(Boolean))];
  const noteIds = rows.map((row) => asString(row.id)).filter(Boolean);

  const [{ data: vendors }, { data: orders }, { data: items }] = await Promise.all([
    vendorIds.length
      ? supabase.from("foodvault_vendors").select("id, name").in("id", vendorIds)
      : Promise.resolve({ data: [] }),
    poIds.length
      ? supabase.from("foodvault_purchase_orders").select("id, po_number").in("id", poIds)
      : Promise.resolve({ data: [] }),
    noteIds.length
      ? supabase.from("foodvault_credit_note_items").select("*").in("credit_note_id", noteIds)
      : Promise.resolve({ data: [] }),
  ]);

  const vendorNames = new Map(
    ((vendors ?? []) as Record<string, unknown>[]).map((row) => [asString(row.id), asString(row.name)])
  );
  const poNumbers = new Map(
    ((orders ?? []) as Record<string, unknown>[]).map((row) => [asString(row.id), asString(row.po_number)])
  );
  const itemsByNote = new Map<string, CreditNoteItem[]>();
  for (const item of (items ?? []) as Record<string, unknown>[]) {
    const noteId = asString(item.credit_note_id);
    const list = itemsByNote.get(noteId) ?? [];
    list.push({
      id: asString(item.id),
      productId: asString(item.product_id) || null,
      sku: asString(item.sku) || null,
      name: asString(item.name) || null,
      discrepancyQty: Math.trunc(asNumber(item.discrepancy_qty)),
      costPrice: asNumber(item.cost_price),
      lineTotal: asNumber(item.line_total),
      reason: asString(item.reason) || null,
    });
    itemsByNote.set(noteId, list);
  }

  return rows.map((row) => ({
    id: asString(row.id),
    creditNumber: asString(row.credit_number),
    poId: asString(row.po_id) || null,
    poNumber: poNumbers.get(asString(row.po_id)) ?? null,
    vendorId: asString(row.vendor_id),
    vendorName: vendorNames.get(asString(row.vendor_id)) ?? "Vendor",
    status: asString(row.status, "draft") as CreditNoteStatus,
    totalClaim: asNumber(row.total_claim),
    reasonSummary: asString(row.reason_summary) || null,
    createdAt: asString(row.created_at),
    items: itemsByNote.get(asString(row.id)) ?? [],
  }));
}

export async function getCreditNote(id: string): Promise<CreditNoteRecord | null> {
  const notes = await listCreditNotes();
  return notes.find((note) => note.id === id) ?? null;
}

export async function lookupProductByBarcode(code: string): Promise<ProductScanInfo | null> {
  const supabase = await wmsClient();
  const scanned = normalizeScanCode(code);
  if (!supabase || !scanned) return null;

  const byBarcode = await supabase
    .from("foodvault_products")
    .select("*")
    .eq("barcode", scanned)
    .limit(1)
    .maybeSingle();
  const bySku = byBarcode.data
    ? byBarcode
    : await supabase.from("foodvault_products").select("*").eq("sku", scanned).limit(1).maybeSingle();

  if (!bySku.data) return null;
  const row = bySku.data as Record<string, unknown>;
  const productId = asString(row.id);

  const { data: batches } = await supabase
    .from("foodvault_inventory_batches")
    .select("*")
    .eq("product_id", productId)
    .order("expiry_date", { ascending: true, nullsFirst: false });

  return {
    id: productId,
    sku: asString(row.sku),
    name: asString(row.name),
    barcode: asString(row.barcode) || null,
    imageUrl: asString(row.image_url) || null,
    stockQuantity: Math.max(0, Math.trunc(asNumber(row.stock_quantity))),
    binLocation: asString(row.bin_location) || null,
    wholesaleCost: asNumber(row.wholesale_cost),
    batches: ((batches ?? []) as Record<string, unknown>[]).map((batch) => ({
      id: asString(batch.id),
      batchNumber: asString(batch.batch_number),
      expiryDate: asString(batch.expiry_date) || null,
      quantityReceived: Math.trunc(asNumber(batch.quantity_received)),
    })),
  };
}

export async function createVendor(input: {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  paymentTerms: string;
  notes: string;
}): Promise<{ id: string | null; error: string | null }> {
  const supabase = await wmsClient();
  if (!supabase) return { id: null, error: "Supabase is not configured." };

  const { data, error } = await supabase
    .from("foodvault_vendors")
    .insert({
      name: input.name,
      contact_name: input.contactName || null,
      email: input.email || null,
      phone: input.phone || null,
      payment_terms: input.paymentTerms || null,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (error) return { id: null, error: error.message };
  return { id: asString((data as { id?: string }).id) || null, error: null };
}

export async function updateVendor(
  id: string,
  input: {
    name: string;
    contactName: string;
    email: string;
    phone: string;
    paymentTerms: string;
    notes: string;
  }
): Promise<string | null> {
  const supabase = await wmsClient();
  if (!supabase) return "Supabase is not configured.";
  const { error } = await supabase
    .from("foodvault_vendors")
    .update({
      name: input.name,
      contact_name: input.contactName || null,
      email: input.email || null,
      phone: input.phone || null,
      payment_terms: input.paymentTerms || null,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  return error?.message ?? null;
}

export async function assignProductsToVendor(vendorId: string, productIds: string[]): Promise<string | null> {
  const supabase = await wmsClient();
  if (!supabase) return "Supabase is not configured.";
  if (productIds.length === 0) return null;
  const { error } = await supabase
    .from("foodvault_products")
    .update({ vendor_id: vendorId, updated_at: new Date().toISOString() })
    .in("id", productIds);
  return error?.message ?? null;
}

export async function createPurchaseOrder(
  vendorId: string,
  lines: Array<{ productId: string; quantity: number }>
): Promise<{ id: string | null; poNumber: string | null; error: string | null }> {
  const supabase = await wmsClient();
  if (!supabase) return { id: null, poNumber: null, error: "Supabase is not configured." };

  const qtyLines = lines.filter((line) => line.quantity > 0);
  if (qtyLines.length === 0) return { id: null, poNumber: null, error: "Add at least one order quantity." };

  const productIds = qtyLines.map((line) => line.productId);
  const { data: products, error: productError } = await supabase
    .from("foodvault_products")
    .select("id, sku, name, barcode, wholesale_cost")
    .in("id", productIds);

  if (productError) return { id: null, poNumber: null, error: productError.message };

  const byId = new Map(
    ((products ?? []) as Record<string, unknown>[]).map((row) => [asString(row.id), row])
  );

  const poNumber = await nextDocumentNumber(supabase, "foodvault_purchase_orders", "po_number", "PO");
  const { data: po, error } = await supabase
    .from("foodvault_purchase_orders")
    .insert({
      po_number: poNumber,
      vendor_id: vendorId,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !po) return { id: null, poNumber: null, error: error?.message ?? "Failed to create PO." };
  const poId = asString((po as { id?: string }).id);

  const items = qtyLines.map((line) => {
    const product = byId.get(line.productId);
    return {
      po_id: poId,
      product_id: line.productId,
      sku: asString(product?.sku),
      name: asString(product?.name, "Product"),
      barcode: asString(product?.barcode) || null,
      quantity_ordered: line.quantity,
      quantity_received: 0,
      cost_price: asNumber(product?.wholesale_cost),
    };
  });

  const { error: itemError } = await supabase.from("foodvault_po_items").insert(items);
  if (itemError) return { id: poId, poNumber, error: itemError.message };
  return { id: poId, poNumber, error: null };
}

export async function receivePoItem(input: {
  itemId: string;
  quantityReceived: number;
  batchNumber: string;
  expiryDate: string;
  discrepancyReason: string | null;
}): Promise<string | null> {
  const supabase = await wmsClient();
  if (!supabase) return "Supabase is not configured.";

  const { data: existing, error: loadError } = await supabase
    .from("foodvault_po_items")
    .select("*")
    .eq("id", input.itemId)
    .maybeSingle();
  if (loadError || !existing) return loadError?.message ?? "PO line not found.";

  const row = existing as Record<string, unknown>;
  const ordered = Math.trunc(asNumber(row.quantity_ordered));
  const received = Math.max(0, Math.trunc(input.quantityReceived));
  const discrepancy = Math.max(0, ordered - received);

  const { error } = await supabase
    .from("foodvault_po_items")
    .update({
      quantity_received: received,
      discrepancy_qty: discrepancy,
      discrepancy_reason: discrepancy > 0 ? input.discrepancyReason || "short_supply" : null,
      batch_number: input.batchNumber || null,
      expiry_date: input.expiryDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.itemId);

  if (error) return error.message;

  await supabase
    .from("foodvault_purchase_orders")
    .update({ status: "receiving", updated_at: new Date().toISOString() })
    .eq("id", asString(row.po_id))
    .eq("status", "open");

  return null;
}

export async function completePurchaseOrderReceiving(poId: string): Promise<{
  creditNoteId: string | null;
  error: string | null;
}> {
  const supabase = await wmsClient();
  if (!supabase) return { creditNoteId: null, error: "Supabase is not configured." };

  const po = await getPurchaseOrder(poId);
  if (!po) return { creditNoteId: null, error: "Purchase order not found." };
  if (po.status === "received") return { creditNoteId: null, error: "This PO is already received." };
  if (po.status === "cancelled") return { creditNoteId: null, error: "This PO is cancelled." };

  const now = new Date().toISOString();
  const claimLines = po.items
    .map((item) => {
      const qty = Math.max(0, item.quantityOrdered - item.quantityReceived);
      return {
        item,
        qty,
        lineTotal: claimValue(item.quantityOrdered, item.quantityReceived, item.costPrice),
        reason: item.discrepancyReason ?? (qty > 0 ? "short_supply" : null),
      };
    })
    .filter((line) => line.qty > 0);

  for (const item of po.items) {
    if (item.quantityReceived <= 0) continue;
    const { error: batchError } = await supabase.from("foodvault_inventory_batches").insert({
      product_id: item.productId,
      quantity_received: item.quantityReceived,
      quantity_remaining: item.quantityReceived,
      unit_cost_price: item.costPrice,
      batch_number: item.batchNumber || `PO-${po.poNumber}`,
      expiry_date: item.expiryDate || null,
    });
    if (batchError) return { creditNoteId: null, error: batchError.message };

    const { data: product } = await supabase
      .from("foodvault_products")
      .select("id, stock_quantity")
      .eq("id", item.productId)
      .maybeSingle();
    const current = Math.max(0, Math.trunc(asNumber((product as { stock_quantity?: unknown } | null)?.stock_quantity)));
    let stockFields: Record<string, unknown> = {
      stock_quantity: current + item.quantityReceived,
      updated_at: now,
    };
    let { error: stockError } = await supabase
      .from("foodvault_products")
      .update(stockFields)
      .eq("id", item.productId);
    if (stockError?.message.match(/Could not find the 'updated_at' column/i)) {
      delete stockFields.updated_at;
      ({ error: stockError } = await supabase
        .from("foodvault_products")
        .update(stockFields)
        .eq("id", item.productId));
    }
    if (stockError) return { creditNoteId: null, error: stockError.message };
  }

  let creditNoteId: string | null = null;
  if (claimLines.length > 0) {
    const creditNumber = await nextDocumentNumber(supabase, "foodvault_credit_notes", "credit_number", "CN");
    const totalClaim = claimLines.reduce((sum, line) => sum + line.lineTotal, 0);
    const reasons = [...new Set(claimLines.map((line) => line.reason).filter(Boolean))];
    const { data: note, error: noteError } = await supabase
      .from("foodvault_credit_notes")
      .insert({
        credit_number: creditNumber,
        po_id: po.id,
        vendor_id: po.vendorId,
        status: "draft",
        total_claim: Number(totalClaim.toFixed(2)),
        reason_summary: `Claim against ${po.poNumber}: ${reasons.join(", ") || "short supply"}`,
      })
      .select("id")
      .single();
    if (noteError || !note) return { creditNoteId: null, error: noteError?.message ?? "Failed to create credit note." };
    creditNoteId = asString((note as { id?: string }).id);

    const { error: itemError } = await supabase.from("foodvault_credit_note_items").insert(
      claimLines.map((line) => ({
        credit_note_id: creditNoteId,
        po_item_id: line.item.id,
        product_id: line.item.productId,
        sku: line.item.sku,
        name: line.item.name,
        discrepancy_qty: line.qty,
        cost_price: line.item.costPrice,
        line_total: Number(line.lineTotal.toFixed(2)),
        reason: line.reason,
      }))
    );
    if (itemError) return { creditNoteId, error: itemError.message };
  }

  const { error: poError } = await supabase
    .from("foodvault_purchase_orders")
    .update({ status: "received", updated_at: now })
    .eq("id", po.id);
  if (poError) return { creditNoteId, error: poError.message };

  return { creditNoteId, error: null };
}
