const ZERO_DECIMAL = new Set(["jpy", "krw"]);

export type PickSettlementLine = {
  itemId: string;
  name: string;
  sku: string;
  productId: string;
  ordered: number;
  picked: number;
  chargeMinor: number;
};

export type PickSettlement = {
  lines: PickSettlementLine[];
  goodsMinor: number;
  shippingMinor: number;
  totalMinor: number;
  capped: boolean;
  unresolved: boolean;
  allOutOfStock: boolean;
  adjustments: PickSettlementLine[];
};

export function amountToMinorUnits(amount: number, currency: string): number {
  if (!Number.isFinite(amount)) return 0;
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? Math.round(amount) : Math.round(amount * 100);
}

export function minorUnitsToAmount(minor: number, currency: string): number {
  if (!Number.isFinite(minor)) return 0;
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? minor : minor / 100;
}

export function minimumCaptureMinor(currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? 1 : 50;
}

export function isPickRecorded(quantityPicked: unknown): boolean {
  return quantityPicked != null && quantityPicked !== "";
}

export function quantityFromOrderItem(record: {
  quantity?: unknown;
  quantity_picked?: unknown;
}): number {
  const ordered = Math.max(0, Math.trunc(Number(record.quantity ?? 0)) || 0);
  if (!isPickRecorded(record.quantity_picked)) return ordered;
  const picked = Math.trunc(Number(record.quantity_picked));
  if (!Number.isFinite(picked)) return ordered;
  return Math.max(0, Math.min(ordered, picked));
}

export function revenueFromOrderItem(record: {
  quantity?: unknown;
  quantity_picked?: unknown;
  line_total?: unknown;
  unit_price?: unknown;
}): number {
  const ordered = Math.max(0, Math.trunc(Number(record.quantity ?? 0)) || 0);
  const lineTotal = Number(record.line_total);
  const unitPrice = Number(record.unit_price);
  const full =
    Number.isFinite(lineTotal) && lineTotal > 0
      ? lineTotal
      : Number.isFinite(unitPrice)
        ? unitPrice * ordered
        : 0;
  if (!isPickRecorded(record.quantity_picked)) return full;
  const qty = quantityFromOrderItem(record);
  if (ordered === 0 || qty === 0) return 0;
  if (qty === ordered) return full;
  return Math.round(((full * qty) / ordered) * 100) / 100;
}

function fullLineMinor(
  line: { quantity: number; lineTotal: number; unitPrice: number },
  currency: string
): number {
  const fromTotal = amountToMinorUnits(line.lineTotal, currency);
  if (fromTotal > 0) return fromTotal;
  return amountToMinorUnits(line.unitPrice * line.quantity, currency);
}

export function settlePicks(input: {
  currency: string;
  shippingCost: number;
  authorizedMinor?: number | null;
  lines: Array<{
    itemId: string;
    name: string;
    sku: string;
    productId?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    quantityPicked: number | null;
  }>;
}): PickSettlement {
  const currency = input.currency || "NZD";
  const unresolved = input.lines.some((line) => line.quantityPicked == null);
  const lines: PickSettlementLine[] = input.lines.map((line) => {
    const ordered = Math.max(0, Math.trunc(line.quantity));
    const picked =
      line.quantityPicked == null
        ? 0
        : Math.max(0, Math.min(ordered, Math.trunc(line.quantityPicked)));
    const full = fullLineMinor({ ...line, quantity: ordered }, currency);
    const chargeMinor =
      line.quantityPicked == null || ordered === 0 || picked === 0
        ? 0
        : picked === ordered
          ? full
          : Math.round((full * picked) / ordered);
    return {
      itemId: line.itemId,
      name: line.name,
      sku: line.sku,
      productId: line.productId ?? "",
      ordered,
      picked: line.quantityPicked == null ? 0 : picked,
      chargeMinor,
    };
  });

  const goodsMinor = lines.reduce((sum, line) => sum + line.chargeMinor, 0);
  const anyPicked = lines.some((line) => line.picked > 0);
  const shippingMinor = anyPicked ? Math.max(0, amountToMinorUnits(input.shippingCost, currency)) : 0;
  let totalMinor = goodsMinor + shippingMinor;
  let capped = false;
  if (input.authorizedMinor != null && totalMinor > input.authorizedMinor) {
    totalMinor = Math.max(0, input.authorizedMinor);
    capped = true;
  }

  const adjustments = lines.filter((line) => line.picked < line.ordered);

  return {
    lines,
    goodsMinor,
    shippingMinor,
    totalMinor,
    capped,
    unresolved,
    allOutOfStock: !unresolved && !anyPicked,
    adjustments,
  };
}
