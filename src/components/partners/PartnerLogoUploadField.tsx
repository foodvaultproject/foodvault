"use client";

import { useRef, useState } from "react";
import { LogoCropEditor } from "@/components/partners/LogoCropEditor";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import {
  portalHelper,
  portalLabel,
  portalTextAction,
  portalThumbLogo,
} from "@/lib/partner-portal-classes";
import {
  DEFAULT_LOGO_CROP,
  revokeIfBlobUrl,
  type LogoCropSettings,
} from "@/lib/partner-logo-crop";

export type PartnerLogoUploadValue = {
  originalFile?: File | null;
  croppedFile: File;
  previewUrl: string;
  crop: LogoCropSettings;
  /** True when only crop changed; original URL stays in database. */
  recropOnly?: boolean;
};

type PartnerLogoUploadFieldProps = {
  businessName: string;
  previewUrl?: string;
  existingOriginalUrl?: string | null;
  existingCrop?: LogoCropSettings | null;
  hasStoredCrop?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  onChange: (value: PartnerLogoUploadValue | null) => void;
  className?: string;
  variant?: "default" | "compact";
};

function UploadIcon() {
  return (
    <svg
      className="h-5 w-5 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

export function PartnerLogoUploadField({
  businessName,
  previewUrl,
  existingOriginalUrl,
  existingCrop,
  hasStoredCrop = false,
  disabled = false,
  label = "Brand Logo",
  hint = "Upload your logo, then adjust how it appears in the circular frame",
  onChange,
  className = "",
  variant = "default",
}: PartnerLogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);
  const [initialCrop, setInitialCrop] = useState<LogoCropSettings>(DEFAULT_LOGO_CROP);
  const [reCropMode, setReCropMode] = useState(false);

  function openFilePicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleFileSelected(file: File) {
    revokeIfBlobUrl(editorSrc ?? undefined);
    const objectUrl = URL.createObjectURL(file);
    setPendingOriginalFile(file);
    setInitialCrop(DEFAULT_LOGO_CROP);
    setReCropMode(false);
    setEditorSrc(objectUrl);
  }

  function handleEditCrop() {
    const src = existingOriginalUrl || previewUrl;
    if (!src || disabled) return;
    revokeIfBlobUrl(editorSrc ?? undefined);
    setPendingOriginalFile(null);
    setInitialCrop(existingCrop ?? DEFAULT_LOGO_CROP);
    setReCropMode(true);
    setEditorSrc(src);
  }

  function closeEditor() {
    revokeIfBlobUrl(editorSrc ?? undefined);
    setEditorSrc(null);
    setPendingOriginalFile(null);
    setReCropMode(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleRemove(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    revokeIfBlobUrl(previewUrl);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleSave(result: {
    croppedBlob: Blob;
    previewUrl: string;
    crop: LogoCropSettings;
  }) {
    const croppedFile = new File([result.croppedBlob], "logo-display.jpg", {
      type: "image/jpeg",
    });

    revokeIfBlobUrl(previewUrl);

    onChange({
      originalFile: pendingOriginalFile,
      croppedFile,
      previewUrl: result.previewUrl,
      crop: result.crop,
      recropOnly: reCropMode && !pendingOriginalFile,
    });
    closeEditor();
  }

  const displayUrl = previewUrl ?? existingOriginalUrl ?? undefined;
  const preferCroppedPreview = Boolean(previewUrl);
  const compact = variant === "compact";

  const actionButtons = displayUrl && !disabled && (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <button type="button" onClick={openFilePicker} className={portalTextAction}>
        Replace
      </button>
      <button type="button" onClick={handleEditCrop} className={portalTextAction}>
        Edit crop
      </button>
      <button type="button" onClick={handleRemove} className={`${portalTextAction} text-red-600 hover:text-red-700`}>
        Remove
      </button>
    </div>
  );

  return (
    <>
      <div className={className}>
        {compact ? (
          <div className="flex flex-wrap items-start gap-4">
            <button
              type="button"
              disabled={disabled}
              onClick={displayUrl ? handleEditCrop : openFilePicker}
              className={`group relative overflow-hidden rounded-full border bg-surface transition-colors ${portalThumbLogo} ${
                displayUrl
                  ? "border-border shadow-sm"
                  : "border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {displayUrl ? (
                <>
                  <PartnerLogo
                    src={displayUrl}
                    originalSrc={preferCroppedPreview ? null : existingOriginalUrl}
                    alt=""
                    businessName={businessName}
                    size="fill"
                    crop={preferCroppedPreview ? null : existingCrop}
                    isCropped={
                      preferCroppedPreview ||
                      !existingOriginalUrl ||
                      !existingCrop?.areaPercent
                    }
                    className="h-full w-full"
                  />
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                    Edit
                  </span>
                </>
              ) : (
                <span className="flex h-full w-full flex-col items-center justify-center gap-1">
                  <UploadIcon />
                </span>
              )}
            </button>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className={portalLabel}>{label}</p>
              <p className={portalHelper}>{hint}</p>
              {actionButtons}
            </div>
          </div>
        ) : (
          <>
            <div
              role={disabled ? undefined : "button"}
              tabIndex={disabled ? undefined : 0}
              onClick={disabled ? undefined : openFilePicker}
              onKeyDown={
                disabled
                  ? undefined
                  : (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openFilePicker();
                      }
                    }
              }
              aria-disabled={disabled || undefined}
              className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface px-4 py-8 text-center transition-colors ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {displayUrl ? (
                <div className="relative">
                  <PartnerLogo
                    src={displayUrl}
                    originalSrc={preferCroppedPreview ? null : existingOriginalUrl}
                    alt=""
                    businessName={businessName}
                    size="md"
                    bordered
                    shadow
                    crop={preferCroppedPreview ? null : existingCrop}
                    isCropped={
                      preferCroppedPreview ||
                      !existingOriginalUrl ||
                      !existingCrop?.areaPercent
                    }
                  />
                  {!disabled ? (
                    <button
                      type="button"
                      onClick={handleRemove}
                      aria-label="Remove logo"
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white transition-opacity hover:bg-black/80"
                    >
                      &times;
                    </button>
                  ) : null}
                </div>
              ) : (
                <UploadIcon />
              )}
              <span className="mt-3 text-sm font-medium text-foreground">{label}</span>
              <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
            </div>
            {actionButtons}
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFileSelected(file);
          }}
        />
      </div>

      {editorSrc ? (
        <LogoCropEditor
          imageSrc={editorSrc}
          initialCrop={initialCrop}
          onCancel={closeEditor}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}
