"use client";

import { useRef, useState } from "react";
import { BannerCropEditor } from "@/components/partners/BannerCropEditor";
import { PartnerBanner } from "@/components/partners/PartnerBanner";
import {
  portalHelper,
  portalLabel,
  portalTextAction,
  portalThumbBanner,
} from "@/lib/partner-portal-classes";
import {
  DEFAULT_BANNER_CROP,
  revokeIfBlobUrl,
  type BannerCropSettings,
} from "@/lib/partner-banner-crop";

export type PartnerBannerUploadValue = {
  originalFile?: File | null;
  croppedFile: File;
  previewUrl: string;
  crop: BannerCropSettings;
  recropOnly?: boolean;
};

type PartnerBannerUploadFieldProps = {
  previewUrl?: string;
  existingOriginalUrl?: string | null;
  existingCrop?: BannerCropSettings | null;
  disabled?: boolean;
  label?: string;
  hint?: string;
  onChange: (value: PartnerBannerUploadValue | null) => void;
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

export function PartnerBannerUploadField({
  previewUrl,
  existingOriginalUrl,
  existingCrop,
  disabled = false,
  label = "Banner Image",
  hint = "Upload your cover image, then adjust position and zoom in the 3:1 frame",
  onChange,
  className = "",
  variant = "default",
}: PartnerBannerUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);
  const [initialCrop, setInitialCrop] = useState<BannerCropSettings>(DEFAULT_BANNER_CROP);
  const [reCropMode, setReCropMode] = useState(false);

  function openFilePicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleFileSelected(file: File) {
    revokeIfBlobUrl(editorSrc ?? undefined);
    setPendingOriginalFile(file);
    setInitialCrop(DEFAULT_BANNER_CROP);
    setReCropMode(false);
    setEditorSrc(URL.createObjectURL(file));
  }

  function handleEditCrop() {
    const src = existingOriginalUrl || previewUrl;
    if (!src || disabled) return;
    revokeIfBlobUrl(editorSrc ?? undefined);
    setPendingOriginalFile(null);
    setInitialCrop(existingCrop ?? DEFAULT_BANNER_CROP);
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

  function handleSave(result: {
    croppedBlob: Blob;
    previewUrl: string;
    crop: BannerCropSettings;
  }) {
    const croppedFile = new File([result.croppedBlob], "banner-display.jpg", {
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
              className={`group relative overflow-hidden rounded-lg border bg-surface transition-colors ${portalThumbBanner} ${
                displayUrl
                  ? "border-border shadow-sm"
                  : "border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {displayUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={displayUrl} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                    Edit
                  </span>
                </>
              ) : (
                <span className="flex h-full w-full flex-col items-center justify-center gap-1">
                  <UploadIcon />
                  <span className="text-[11px] font-medium text-muted-foreground">Upload</span>
                </span>
              )}
            </button>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className={portalLabel}>{label}</p>
              <p className={portalHelper}>{hint}</p>
              <p className={portalHelper}>3:1 ratio · 1800×600 px recommended</p>
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
              className={`w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-surface text-center transition-colors ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {displayUrl ? (
                <div className="relative">
                  <PartnerBanner src={displayUrl} alt="" sizes="(max-width: 768px) 100vw, 600px" />
                  {!disabled ? (
                    <button
                      type="button"
                      onClick={handleRemove}
                      aria-label="Remove banner"
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white transition-opacity hover:bg-black/80"
                    >
                      &times;
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="flex aspect-[3/1] flex-col items-center justify-center px-4 py-8">
                  <UploadIcon />
                  <span className="mt-3 text-sm font-medium text-foreground">{label}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
                  <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    3:1 ratio · 1800×600 px
                  </span>
                </div>
              )}
            </div>
            {displayUrl && !disabled ? (
              <div className="mt-2 flex flex-wrap gap-3">
                <button type="button" onClick={openFilePicker} className={portalTextAction}>
                  Replace image
                </button>
                <button type="button" onClick={handleEditCrop} className={portalTextAction}>
                  Edit crop
                </button>
              </div>
            ) : displayUrl ? null : (
              <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
            )}
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
        <BannerCropEditor
          imageSrc={editorSrc}
          initialCrop={initialCrop}
          onCancel={closeEditor}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}
