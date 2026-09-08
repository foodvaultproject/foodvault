export const PO_STATUSES = ["open", "receiving", "received", "cancelled"] as const;
export type PurchaseOrderStatus = (typeof PO_STATUSES)[number];

export const CREDIT_NOTE_STATUSES = ["draft", "submitted", "settled"] as const;
export type CreditNoteStatus = (typeof CREDIT_NOTE_STATUSES)[number];

export const DISCREPANCY_REASONS = [
  { value: "short_supply", label: "Short supply" },
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
] as const;

export type DiscrepancyReason = (typeof DISCREPANCY_REASONS)[number]["value"];

export type VendorRecord = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  paymentTerms: string | null;
  notes: string | null;
  productCount: number;
  openPoCount: number;
};

export type VendorProductRow = {
  id: string;
  sku: string;
  name: string;
  barcode: string | null;
  wholesaleCost: number;
  stockQuantity: number;
  salesVelocity30d: number;
  imageUrl: string | null;
  binLocation: string | null;
};

export type PurchaseOrderItem = {
  id: string;
  poId: string;
  productId: string;
  sku: string;
  name: string;
  barcode: string | null;
  quantityOrdered: number;
  quantityReceived: number;
  costPrice: number;
  discrepancyQty: number;
  discrepancyReason: DiscrepancyReason | null;
  batchNumber: string | null;
  expiryDate: string | null;
};

export type PurchaseOrderRecord = {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  status: PurchaseOrderStatus;
  notes: string | null;
  createdAt: string;
  itemCount: number;
  orderedUnits: number;
  receivedUnits: number;
  items: PurchaseOrderItem[];
};

export type CreditNoteItem = {
  id: string;
  productId: string | null;
  sku: string | null;
  name: string | null;
  discrepancyQty: number;
  costPrice: number;
  lineTotal: number;
  reason: string | null;
};

export type CreditNoteRecord = {
  id: string;
  creditNumber: string;
  poId: string | null;
  poNumber: string | null;
  vendorId: string;
  vendorName: string;
  status: CreditNoteStatus;
  totalClaim: number;
  reasonSummary: string | null;
  createdAt: string;
  items: CreditNoteItem[];
};

export type ProductScanInfo = {
  id: string;
  sku: string;
  name: string;
  barcode: string | null;
  imageUrl: string | null;
  stockQuantity: number;
  binLocation: string | null;
  wholesaleCost: number;
  batches: Array<{
    id: string;
    batchNumber: string;
    expiryDate: string | null;
    quantityReceived: number;
  }>;
};

export function normalizeScanCode(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

export function discrepancyLabel(reason: string | null | undefined): string {
  return DISCREPANCY_REASONS.find((row) => row.value === reason)?.label ?? reason ?? "—";
}

export function claimValue(ordered: number, received: number, cost: number): number {
  return Math.max(0, ordered - received) * Math.max(0, cost);
}
