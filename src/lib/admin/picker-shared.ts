import type { FoodVaultOrderStatus } from "@/types/commerce";

export type PickerQueueTab = "pick" | "fulfilled" | "scan" | "receive";

export type PickerQueueCard = {
  id: string;
  shortId: string;
  customerName: string;
  addressSummary: string;
  itemCount: number;
  total: number;
  paidAt: string;
  status: FoodVaultOrderStatus;
};

export type PickerLine = {
  itemId: string;
  productId: string;
  name: string;
  sku: string;
  brand: string;
  quantity: number;
  imageUrl: string | null;
  binLocation: string;
  barcode: string | null;
};

export type PickerOrderDetail = {
  id: string;
  shortId: string;
  status: FoodVaultOrderStatus;
  customerName: string;
  addressSummary: string;
  total: number;
  paidAt: string;
  trackingNumber: string | null;
  lines: PickerLine[];
};

export function shortOrderId(id: string): string {
  const compact = id.replace(/-/g, "").slice(-8).toUpperCase();
  return compact || id.slice(0, 8).toUpperCase();
}

export function formatElapsedSince(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "—";
  const mins = Math.max(0, Math.floor((now - then) / 60_000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function compareBinLocation(a: string, b: string): number {
  const left = a.trim() || "zzz";
  const right = b.trim() || "zzz";
  return left.localeCompare(right, "en", { numeric: true, sensitivity: "base" });
}

export function displayBinLocation(binLocation: string): string {
  return binLocation.trim() || "Unassigned";
}

export const PICKER_STORAGE_PREFIX = "fv.picker.picked.";

export function packingSlipPath(orderId: string, autoprint = false): string {
  const path = `/admin/orders/${orderId}/packing-slip`;
  return autoprint ? `${path}?autoprint=true` : path;
}
