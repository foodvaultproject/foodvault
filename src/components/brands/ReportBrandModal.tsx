"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import {
  BRAND_REPORT_MAX_ATTACHMENTS,
  BRAND_REPORT_MAX_DESCRIPTION,
  BRAND_REPORT_REASONS,
} from "@/lib/brand-reports/constants";
import { submitBrandReportAction } from "@/lib/member/brand-report-actions";
import { LOGIN_PATH } from "@/lib/auth";

type ReportBrandModalProps = {
  open: boolean;
  onClose: () => void;
  brandId: string;
  brandName: string;
  isLoggedIn: boolean;
  canSubmit: boolean;
};

export function ReportBrandModal({
  open,
  onClose,
  brandId,
  brandName,
  isLoggedIn,
  canSubmit,
}: ReportBrandModalProps) {
  const [reason, setReason] = useState(BRAND_REPORT_REASONS[0].value);
  const [description, setDescription] = useState("");
  const [contactPermission, setContactPermission] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function resetForm() {
    setReason(BRAND_REPORT_REASONS[0].value);
    setDescription("");
    setContactPermission(false);
    setFiles([]);
    setError(null);
    setSuccessReference(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setFiles(selected.slice(0, BRAND_REPORT_MAX_ATTACHMENTS));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    const formData = new FormData();
    files.forEach((file) => formData.append("attachments", file));

    startTransition(async () => {
      const result = await submitBrandReportAction(
        {
          brandId,
          reason,
          description,
          contactPermission,
        },
        formData
      );

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      if ("success" in result && result.success) {
        setSuccessReference(result.reportReference);
      }
    });
  }

  if (successReference) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl"
        >
          <h2 className="text-lg font-bold text-foreground">Thank you.</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your report has been submitted successfully. Our moderation team will
            review the information and take appropriate action if required.
          </p>
          <p className="mt-4 font-mono text-sm font-semibold text-foreground">
            Report #{successReference}
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-brand-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-xl"
      >
        <h2 id="report-brand-title" className="text-lg font-bold text-foreground">
          Report this Brand
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Help us keep FoodVault trustworthy. Every report is reviewed by our
          moderation team before any action is taken.
        </p>

        {!isLoggedIn ? (
          <div className="mt-5 rounded-lg border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
            You must be signed in as a member to submit a report.{" "}
            <Link href={LOGIN_PATH} className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        ) : !canSubmit ? (
          <div className="mt-5 rounded-lg border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
            Brand reports can only be submitted by FoodVault members.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <fieldset>
              <legend className="text-sm font-semibold text-foreground">
                Reason <span className="text-red-500">*</span>
              </legend>
              <div className="mt-2 space-y-2">
                {BRAND_REPORT_REASONS.map((item) => (
                  <label
                    key={item.value}
                    className="flex cursor-pointer items-start gap-2 rounded-sm border border-border px-3 py-2 text-sm transition-colors hover:bg-surface has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={item.value}
                      checked={reason === item.value}
                      onChange={() => setReason(item.value)}
                      className="mt-0.5"
                    />
                    <span className="text-foreground">{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="report-description" className="text-sm font-semibold text-foreground">
                Additional details <span className="text-red-500">*</span>
              </label>
              <textarea
                id="report-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={BRAND_REPORT_MAX_DESCRIPTION}
                rows={5}
                required
                placeholder="Please describe the issue in as much detail as possible."
                className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {description.length}/{BRAND_REPORT_MAX_DESCRIPTION}
              </p>
            </div>

            <div>
              <label htmlFor="report-evidence" className="text-sm font-semibold text-foreground">
                Evidence <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, or PDF. Up to {BRAND_REPORT_MAX_ATTACHMENTS} files, 10 MB each.
              </p>
              <input
                ref={fileInputRef}
                id="report-evidence"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                multiple
                onChange={handleFileChange}
                className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground"
              />
              {files.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {files.map((file) => (
                    <li key={`${file.name}-${file.size}`}>{file.name}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <label className="flex items-start gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={contactPermission}
                onChange={(event) => setContactPermission(event.target.checked)}
                className="mt-0.5"
              />
              <span>FoodVault may contact me if additional information is required.</span>
            </label>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={pending}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending || !description.trim()}
                className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
              >
                {pending ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}

        {!canSubmit || !isLoggedIn ? (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
            >
              Close
            </button>
          </div>
        ) : null}

        <p className="sr-only">Reporting {brandName}</p>
      </div>
    </div>
  );
}
