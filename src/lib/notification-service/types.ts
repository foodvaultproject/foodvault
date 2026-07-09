export type NotificationRecipientType = "partner" | "affiliate" | "admin";

export type NotificationEventType =
  | "NEW_AFFILIATE_REGISTERED"
  | "CLICK_MILESTONE"
  | "FIRST_SALE"
  | "FIRST_CLICK"
  | "MONTHLY_SUMMARY"
  | "AFFILIATE_PAYMENT_SENT"
  | "AFFILIATE_WELCOME"
  | "COMMISSION_APPROVED"
  | "COMMISSION_ADJUSTED"
  | "PAYOUT_SCHEDULED"
  | "PAYOUT_FAILED"
  | "PARTNER_PROGRAM_ENABLED"
  | "PARTNER_PROGRAM_DISABLED"
  | "STORE_CONNECTED"
  | "STORE_DISCONNECTED"
  | "INVOICE_GENERATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "WEBHOOK_FAILURE";

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type DashboardInsight = {
  type: string;
  title: string;
  body: string;
  priority: number;
};

export type AffiliateSystemHealth = {
  webhookTotal7d: number;
  webhookFailed7d: number;
  emailPending: number;
  storesConnected: number;
  notificationBacklog: number;
};

export type NotificationEventRow = {
  id: string;
  event_type: NotificationEventType;
  partner_id: string | null;
  affiliate_id: string | null;
  payload: Record<string, unknown>;
  recipient_type: NotificationRecipientType | null;
  template_key: string | null;
  email_status: string;
  email_attempts: number;
  created_at: string;
};

export type RenderedNotification = {
  title: string;
  body: string;
  subject: string;
  html: string;
};
