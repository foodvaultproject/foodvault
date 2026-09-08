import { isSupabaseConfigured } from "@/lib/auth";
import {
  creditStatusLabel,
  type AbcClass,
  type AbcInventoryRow,
  type CategoryProfitRow,
  type CreditClaimRow,
  type DatePreset,
  type InventoryReportData,
  type LostSaleRow,
  type ReorderStatus,
  type ReportDateRange,
  type SalesReportData,
  type ShrinkageRow,
  type VendorOtifRow,
  type VendorReportData,
} from "@/lib/admin/market-reports-shared";
import { listAdminProducts, listInventoryBatches } from "@/lib/admin/pantry";
import { listCreditNotes, listPurchaseOrders, listVendors } from "@/lib/admin/wms";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const RANGE_PRESETS = new Set(["today", "7d", "30d", "ytd", "custom"]);

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function reportsClient() {
  return createAdminClient() ?? (isSupabaseConfigured() ? await createClient() : null);
}

function nzDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return { year, month, day, iso: `${year}-${month}-${day}` };
}

function nzMidnightUtc(ymd: string): Date {
  for (const offset of ["+13:00", "+12:00"]) {
    const candidate = new Date(`${ymd}T00:00:00${offset}`);
    if (nzDateParts(candidate).iso === ymd) return candidate;
  }
  return new Date(`${ymd}T00:00:00+12:00`);
}

function addDaysYmd(ymd: string, days: number): string {
  const date = nzMidnightUtc(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return nzDateParts(date).iso;
}

export function resolveReportRange(input: {
  range?: string;
  from?: string;
  to?: string;
  now?: Date;
}): ReportDateRange {
  const preset: DatePreset = RANGE_PRESETS.has(input.range ?? "") ? (input.range as DatePreset) : "30d";
  const today = nzDateParts(input.now ?? new Date()).iso;
  let fromInput = today;
  let toInput = today;

  if (preset === "today") {
    fromInput = today;
  } else if (preset === "7d") {
    fromInput = addDaysYmd(today, -6);
  } else if (preset === "30d") {
    fromInput = addDaysYmd(today, -29);
  } else if (preset === "ytd") {
    fromInput = `${today.slice(0, 4)}-01-01`;
  } else {
    fromInput = /^\d{4}-\d{2}-\d{2}$/.test(input.from ?? "") ? (input.from as string) : addDaysYmd(today, -29);
    toInput = /^\d{4}-\d{2}-\d{2}$/.test(input.to ?? "") ? (input.to as string) : today;
  }

  if (preset !== "custom") toInput = today;
  if (fromInput > toInput) {
    const swap = fromInput;
    fromInput = toInput;
    toInput = swap;
  }

  return {
    preset,
    start: nzMidnightUtc(fromInput).toISOString(),
    end: nzMidnightUtc(addDaysYmd(toInput, 1)).toISOString(),
    fromInput,
    toInput,
  };
}

function unitCostForProduct(
  productId: string,
  wholesaleCost: number | null | undefined,
  costByProduct: Map<string, { qty: number; cost: number }>
) {
  if (wholesaleCost && wholesaleCost > 0) return wholesaleCost;
  const batch = costByProduct.get(productId);
  if (batch && batch.qty > 0) return batch.cost / batch.qty;
  return 0;
}

function reorderStatus(soh: number, daysOfSupply: number | null): ReorderStatus {
  if (soh <= 0) return "Stockout Risk";
  if (daysOfSupply == null) return "Sufficient";
  if (daysOfSupply < 14) return "Stockout Risk";
  if (daysOfSupply < 30) return "Reorder Soon";
  return "Sufficient";
}

function classifyAbc(rows: Array<{ revenue30d: number }>): AbcClass[] {
  const total = rows.reduce((sum, row) => sum + row.revenue30d, 0);
  if (total <= 0) return rows.map(() => "C");

  let cumulative = 0;
  return rows.map((row) => {
    if (row.revenue30d <= 0) return "C";
    const before = cumulative / total;
    cumulative += row.revenue30d;
    if (before < 0.8) return "A";
    if (before < 0.95) return "B";
    return "C";
  });
}

export async function getSalesReport(range: ReportDateRange): Promise<SalesReportData> {
  const empty: SalesReportData = {
    range,
    summary: {
      revenue: 0,
      cogs: 0,
      grossMargin: 0,
      grossMarginPct: 0,
      memberSavings: 0,
      aov: 0,
      basketSize: 0,
      orderCount: 0,
      itemCount: 0,
    },
    categories: [],
  };

  const supabase = await reportsClient();
  if (!supabase) return empty;

  const { data: orders, error } = await supabase
    .from("foodvault_orders")
    .select("id, total, total_savings, status, created_at")
    .in("status", ["paid", "fulfilled"])
    .gte("created_at", range.start)
    .lt("created_at", range.end);

  if (error) {
    console.error("[market-reports] failed to load orders", error.message);
    return empty;
  }

  const orderRows = (orders ?? []) as Record<string, unknown>[];
  const orderIds = orderRows.map((row) => asString(row.id)).filter(Boolean);
  const [products, batches] = await Promise.all([listAdminProducts(), listInventoryBatches()]);
  const costByProduct = new Map<string, { qty: number; cost: number }>();
  for (const batch of batches) {
    const current = costByProduct.get(batch.product_id) ?? { qty: 0, cost: 0 };
    current.qty += batch.quantity_received;
    current.cost += batch.quantity_received * batch.unit_cost_price;
    costByProduct.set(batch.product_id, current);
  }
  const productsById = new Map(products.map((product) => [product.id, product]));
  const productsBySku = new Map(products.map((product) => [product.sku, product]));

  let itemRows: Record<string, unknown>[] = [];
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("foodvault_order_items")
      .select("order_id, product_id, sku, name, quantity, unit_price, line_total")
      .in("order_id", orderIds);
    itemRows = (items ?? []) as Record<string, unknown>[];
  }

  const revenue = orderRows.reduce((sum, row) => sum + asNumber(row.total), 0);
  const memberSavings = orderRows.reduce((sum, row) => sum + asNumber(row.total_savings), 0);
  const itemCount = itemRows.reduce((sum, row) => sum + Math.max(0, Math.trunc(asNumber(row.quantity))), 0);
  const orderCount = orderRows.length;

  const categoryMap = new Map<string, CategoryProfitRow>();
  let cogs = 0;

  for (const item of itemRows) {
    const qty = Math.max(0, Math.trunc(asNumber(item.quantity)));
    const lineRevenue = asNumber(item.line_total) || asNumber(item.unit_price) * qty;
    const product =
      productsById.get(asString(item.product_id)) ?? productsBySku.get(asString(item.sku)) ?? null;
    const cost = unitCostForProduct(product?.id ?? asString(item.product_id), product?.wholesale_cost, costByProduct);
    const lineCogs = cost * qty;
    cogs += lineCogs;

    const category = product?.category || "Uncategorised";
    const subcategory = product?.subcategory || "General";
    const key = `${category}::${subcategory}`;
    const current = categoryMap.get(key) ?? {
      category,
      subcategory,
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      averageStockValue: 0,
      gmroi: null,
    };
    current.revenue += lineRevenue;
    current.cogs += lineCogs;
    current.grossProfit = current.revenue - current.cogs;
    categoryMap.set(key, current);
  }

  const stockByCategory = new Map<string, number>();
  for (const product of products) {
    const key = `${product.category || "Uncategorised"}::${product.subcategory || "General"}`;
    const cost = unitCostForProduct(product.id, product.wholesale_cost, costByProduct);
    stockByCategory.set(key, (stockByCategory.get(key) ?? 0) + product.stock_quantity * cost);
  }

  const categories = [...categoryMap.values()]
    .map((row) => {
      const averageStockValue = stockByCategory.get(`${row.category}::${row.subcategory}`) ?? 0;
      return {
        ...row,
        averageStockValue,
        gmroi: averageStockValue > 0 ? row.grossProfit / averageStockValue : null,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const grossMargin = revenue - cogs;
  return {
    range,
    summary: {
      revenue,
      cogs,
      grossMargin,
      grossMarginPct: revenue > 0 ? (grossMargin / revenue) * 100 : 0,
      memberSavings,
      aov: orderCount > 0 ? revenue / orderCount : 0,
      basketSize: orderCount > 0 ? itemCount / orderCount : 0,
      orderCount,
      itemCount,
    },
    categories,
  };
}

export async function getInventoryReport(): Promise<InventoryReportData> {
  const empty: InventoryReportData = { abcRows: [], deadStock: [], lostSales: [], lostSalesTotal: 0 };
  const supabase = await reportsClient();
  const products = await listAdminProducts();
  if (!supabase || products.length === 0) return empty;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: orders } = await supabase
    .from("foodvault_orders")
    .select("id")
    .in("status", ["paid", "fulfilled"])
    .gte("created_at", since);
  const orderIds = (orders ?? []).map((row) => asString((row as Record<string, unknown>).id)).filter(Boolean);

  const soldQty = new Map<string, number>();
  const soldRev = new Map<string, number>();
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("foodvault_order_items")
      .select("product_id, sku, quantity, unit_price, line_total")
      .in("order_id", orderIds);
    for (const item of items ?? []) {
      const record = item as Record<string, unknown>;
      const qty = Math.max(0, Math.trunc(asNumber(record.quantity)));
      const revenue = asNumber(record.line_total) || asNumber(record.unit_price) * qty;
      for (const key of [asString(record.product_id), asString(record.sku)].filter(Boolean)) {
        soldQty.set(key, (soldQty.get(key) ?? 0) + qty);
        soldRev.set(key, (soldRev.get(key) ?? 0) + revenue);
      }
    }
  }

  const ranked = products
    .map((product) => {
      const velocity30d = soldQty.get(product.id) ?? soldQty.get(product.sku) ?? 0;
      const revenue30d = soldRev.get(product.id) ?? soldRev.get(product.sku) ?? 0;
      const daily = velocity30d / 30;
      const daysOfSupply = daily > 0 ? product.stock_quantity / daily : product.stock_quantity > 0 ? null : 0;
      return {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        soh: product.stock_quantity,
        velocity30d,
        revenue30d,
        daysOfSupply,
        abcClass: "C" as AbcClass,
        reorderStatus: reorderStatus(product.stock_quantity, daysOfSupply),
      };
    })
    .sort((a, b) => b.revenue30d - a.revenue30d);

  const classes = classifyAbc(ranked);
  const abcRows: AbcInventoryRow[] = ranked.map((row, index) => ({
    ...row,
    abcClass: classes[index] ?? "C",
  }));

  const deadStock = abcRows.filter((row) => {
    if (row.abcClass !== "C") return false;
    if (row.soh <= 0) return false;
    return row.daysOfSupply == null || row.daysOfSupply > 60;
  });

  const { data: demand, error: demandError } = await supabase
    .from("foodvault_lost_sales")
    .select("product_id, sku, name, source, estimated_revenue")
    .gte("created_at", since);

  const lostMap = new Map<string, LostSaleRow>();
  if (!demandError) {
    for (const row of (demand ?? []) as Record<string, unknown>[]) {
      const id = asString(row.product_id);
      if (!id) continue;
      const current = lostMap.get(id) ?? {
        productId: id,
        sku: asString(row.sku),
        name: asString(row.name, "Vault Market item"),
        views: 0,
        searches: 0,
        estimatedRevenue: 0,
      };
      if (asString(row.source) === "search") current.searches += 1;
      else current.views += 1;
      current.estimatedRevenue += asNumber(row.estimated_revenue);
      lostMap.set(id, current);
    }
  }

  const lostSales = [...lostMap.values()].sort((a, b) => b.estimatedRevenue - a.estimatedRevenue);
  return {
    abcRows,
    deadStock,
    lostSales,
    lostSalesTotal: lostSales.reduce((sum, row) => sum + row.estimatedRevenue, 0),
  };
}

export async function getVendorReport(): Promise<VendorReportData> {
  const [vendors, orders, notes, batches, products] = await Promise.all([
    listVendors(),
    listPurchaseOrders(),
    listCreditNotes(),
    listInventoryBatches(),
    listAdminProducts(),
  ]);

  const shrinkageMap = new Map<string, ShrinkageRow>();
  const addShrink = (reason: string, units: number, value: number) => {
    const current = shrinkageMap.get(reason) ?? { reason, units: 0, value: 0 };
    current.units += units;
    current.value += value;
    shrinkageMap.set(reason, current);
  };

  for (const note of notes) {
    for (const item of note.items) {
      const reason =
        item.reason === "damaged"
          ? "Damaged"
          : item.reason === "expired"
            ? "Expired"
            : "Unaccounted";
      addShrink(reason, item.discrepancyQty, item.lineTotal);
    }
  }

  const today = nzDateParts(new Date()).iso;
  const productCost = new Map(products.map((product) => [product.id, product.wholesale_cost ?? 0]));
  for (const batch of batches) {
    if (!batch.expiry_date || batch.expiry_date >= today) continue;
    const cost = batch.unit_cost_price || productCost.get(batch.product_id) || 0;
    addShrink("Expired on hand", batch.quantity_received, batch.quantity_received * cost);
  }

  const vendorRows: VendorOtifRow[] = vendors.map((vendor) => {
    const vendorPos = orders.filter((order) => order.vendorId === vendor.id && order.status === "received");
    const unitsOrdered = vendorPos.reduce((sum, order) => sum + order.orderedUnits, 0);
    const unitsReceived = vendorPos.reduce((sum, order) => sum + order.receivedUnits, 0);
    const qualityIssueUnits = vendorPos.reduce(
      (sum, order) =>
        sum +
        order.items
          .filter((item) => item.discrepancyReason === "damaged" || item.discrepancyReason === "expired")
          .reduce((inner, item) => inner + item.discrepancyQty, 0),
      0
    );
    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      poCount: vendorPos.length,
      unitsOrdered,
      unitsReceived,
      fulfillmentPct: unitsOrdered > 0 ? (unitsReceived / unitsOrdered) * 100 : 0,
      qualityIssueUnits,
    };
  });

  const creditClaims: CreditClaimRow[] = notes.map((note) => ({
    id: note.id,
    creditNumber: note.creditNumber,
    vendorName: note.vendorName,
    poNumber: note.poNumber,
    totalClaim: note.totalClaim,
    status: note.status,
    statusLabel: creditStatusLabel(note.status),
    createdAt: note.createdAt,
  }));

  const shrinkage = [...shrinkageMap.values()].sort((a, b) => b.value - a.value);
  return {
    shrinkage,
    shrinkageTotal: shrinkage.reduce((sum, row) => sum + row.value, 0),
    vendors: vendorRows.sort((a, b) => b.unitsOrdered - a.unitsOrdered),
    creditClaims,
  };
}
