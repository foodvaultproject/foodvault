"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveVendorAction } from "@/lib/admin/wms-actions";
import type { VendorRecord } from "@/lib/admin/wms-shared";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

export function VendorForm({ vendor }: { vendor?: VendorRecord | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveVendorAction(formData);
      if (result.error || !result.id) {
        setError(result.error ?? "Could not save vendor.");
        return;
      }
      router.push(`/admin/vendors/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5 rounded border border-border bg-white p-5 sm:p-6">
      {vendor ? <input type="hidden" name="id" value={vendor.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="name">Vendor name</label>
          <input id="name" name="name" required defaultValue={vendor?.name ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact_name">Contact name</label>
          <input id="contact_name" name="contact_name" defaultValue={vendor?.contactName ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="payment_terms">Payment terms</label>
          <input id="payment_terms" name="payment_terms" placeholder="Net 30" defaultValue={vendor?.paymentTerms ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={vendor?.email ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" defaultValue={vendor?.phone ?? ""} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={vendor?.notes ?? ""} className={inputClass} />
        </div>
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="fv-btn-primary rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        {pending ? "Saving…" : vendor ? "Save vendor" : "Create vendor"}
      </button>
    </form>
  );
}
