export const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "ytd", label: "Year-to-Date" },
  { value: "custom", label: "Custom" },
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number]["value"];

export type ReportDateRange = {
  preset: DatePreset;
  start: string;
  end: string;
  fromInput: string;
  toInput: string;
};

export type SalesSummary = {
  revenue: number;
  cogs: number;
  grossMargin: number;
  grossMarginPct: number;
  memberSavings: number;
  aov: number;
  basketSize: number;
  orderCount: number;
  itemCount: number;
};

export type CategoryProfitRow = {
  category: string;
  subcategory: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  averageStockValue: number;
  gmroi: number | null;
};

export type SalesReportData = {
  range: ReportDateRange;
  summary: SalesSummary;
  categories: CategoryProfitRow[];
};

export type AbcClass = "A" | "B" | "C";
export type ReorderStatus = "Sufficient" | "Reorder Soon" | "Stockout Risk";

export type AbcInventoryRow = {
  productId: string;
  sku: string;
  name: string;
  soh: number;
  velocity30d: number;
  revenue30d: number;
  daysOfSupply: number | null;
  abcClass: AbcClass;
  reorderStatus: ReorderStatus;
};

export type LostSaleRow = {
  productId: string;
  sku: string;
  name: string;
  views: number;
  searches: number;
  estimatedRevenue: number;
};

export type InventoryReportData = {
  abcRows: AbcInventoryRow[];
  deadStock: AbcInventoryRow[];
  lostSales: LostSaleRow[];
  lostSalesTotal: number;
};

export type ShrinkageRow = {
  reason: string;
  units: number;
  value: number;
};

export type VendorOtifRow = {
  vendorId: string;
  vendorName: string;
  poCount: number;
  unitsOrdered: number;
  unitsReceived: number;
  fulfillmentPct: number;
  qualityIssueUnits: number;
};

export type CreditClaimRow = {
  id: string;
  creditNumber: string;
  vendorName: string;
  poNumber: string | null;
  totalClaim: number;
  status: string;
  statusLabel: string;
  createdAt: string;
};

export type VendorReportData = {
  shrinkage: ShrinkageRow[];
  shrinkageTotal: number;
  vendors: VendorOtifRow[];
  creditClaims: CreditClaimRow[];
};

export function creditStatusLabel(status: string): string {
  if (status === "submitted") return "Submitted to Vendor";
  if (status === "settled") return "Settled";
  return "Draft";
}

export function formatDos(days: number | null): string {
  if (days == null) return "∞";
  if (!Number.isFinite(days)) return "∞";
  return `${Math.round(days)}d`;
}

export function formatGmroi(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}
