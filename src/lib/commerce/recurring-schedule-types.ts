import type { ScheduleFrequency, ScheduleStatus } from "@/lib/commerce/recurring-schedule-dates";

export type ScheduleAddress = {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  suburb: string;
  city: string;
  postcode: string;
  deliveryNotes: string;
};

export type ScheduleLine = {
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string | null;
  available: boolean;
};

export type ScheduleDateRow = {
  date: string;
  skipped: boolean;
};

export type ScheduleRecord = {
  id: string;
  name: string;
  status: ScheduleStatus;
  frequencyType: ScheduleFrequency;
  intervalDays: number | null;
  nextRunDate: string | null;
  endDate: string | null;
  pausedUntil: string | null;
  address: ScheduleAddress;
  items: ScheduleLine[];
  customDates: ScheduleDateRow[];
  subtotal: number;
  freight: number;
};

export type ScheduleChoice = {
  id: string;
  name: string;
  status: Exclude<ScheduleStatus, "CANCELLED">;
};

export type ScheduleDraft = {
  id?: string;
  name: string;
  frequencyType: ScheduleFrequency;
  intervalDays: number | null;
  startDate: string;
  endDate: string | null;
  customDates: string[];
  address: ScheduleAddress;
  items: Array<{ productId: string; quantity: number }>;
};
