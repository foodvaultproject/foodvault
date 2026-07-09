export type StorePlatform = "shopify" | "woocommerce" | "bigcommerce" | "magento" | "custom";

export type StoreIntegrationStatus = "connected" | "disconnected" | "error" | "paused";

export type CommissionStatus = "pending" | "approved" | "paid" | "cancelled" | "refunded";

export type PartnerStoreIntegration = {
  connected: boolean;
  platform?: StorePlatform;
  storeName?: string;
  storeUrl?: string | null;
  externalStoreId?: string;
  status?: StoreIntegrationStatus;
  connectedAt?: string;
  disconnectedAt?: string | null;
  lastSyncAt?: string | null;
};

/** Normalized order event — every ecommerce provider outputs this shape. */
export type NormalizedOrderEvent = {
  externalOrderId: string;
  orderNumber: string;
  orderDate: string;
  grossTotal: number;
  currency: string;
  externalStatus: string;
  sessionToken: string | null;
  attributionMethod: string | null;
  lineItems: NormalizedOrderLineItem[];
  rawPayload: Record<string, unknown>;
};

export type NormalizedOrderLineItem = {
  productTitle: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type NormalizedRefundEvent = {
  externalOrderId: string;
  externalRefundId: string | null;
  refundAmount: number;
  externalStatus: string;
  rawPayload: Record<string, unknown>;
};

export type PartnerAffiliateOrderRow = {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  grossTotal: number;
  currency: string;
  commissionId: string | null;
  commissionPercent: number | null;
  commissionValue: number | null;
  commissionStatus: CommissionStatus | null;
  affiliateId: string | null;
  affiliateName: string;
};

export type AffiliateOrderRow = {
  commissionId: string;
  orderNumber: string;
  orderDate: string;
  grossTotal: number;
  commissionPercent: number;
  commissionValue: number;
  currency: string;
  status: CommissionStatus;
  brandName: string;
  brandSlug: string | null;
};

export type AdminAffiliateTransactionSummary = {
  platformSales: number;
  pendingCommission: number;
  approvedCommission: number;
  paidCommission: number;
  refundedCommission: number;
  cancelledCommission: number;
};

export type AdminAffiliateTransactionRow = {
  id: string;
  orderNumber: string;
  orderDate: string;
  grossSale: number;
  commissionValue: number;
  currency: string;
  status: CommissionStatus;
  reviewRequired: boolean;
  businessName: string;
  brandSlug: string | null;
  affiliateName: string;
  affiliateEmail: string;
  platform: StorePlatform | null;
};
