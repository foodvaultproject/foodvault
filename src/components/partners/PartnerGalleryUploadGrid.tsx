"use client";

import { useRef, useState } from "react";
import { GalleryCropEditor } from "@/components/partners/GalleryCropEditor";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import { portalTextAction, portalThumbGallery } from "@/lib/partner-portal-classes";
import {
  DEFAULT_GALLERY_CROP,
  revokeIfBlobUrl,
  type GalleryCropSettings,
} from "@/lib/partner-gallery-crop";

export type PartnerGalleryUploadValue = {
  croppedFile: File;
  originalFile?: File | null;
  previewUrl: string;
  crop: GalleryCropSettings;
  recropOnly?: boolean;
  existingOriginalUrl?: string | null;
};

export type PartnerGalleryItem = {
  displayUrl: string;
  originalUrl: string | null;
  crop: GalleryCropSettings | null;
};

type PartnerGalleryUploadGridProps = {
  items: PartnerGalleryItem[];
  minItems?: number;
  maxItems?: number;
  disabled?: boolean;
  uploading?: boolean;
  onChange: (items: PartnerGalleryItem[]) => void;
  onUploadItem: (value: PartnerGalleryUploadValue) => Promise<PartnerGalleryItem>;
  className?: string;
  variant?: "default" | "compact";
};

function GallerySlot({
  item,
  disabled,
  compact,
  onRemove,
  onReplace,
  onEditCrop,
}: {
  item?: PartnerGalleryItem;
  disabled?: boolean;
  compact?: boolean;
  onRemove: () => void;
  onReplace: () => void;
  onEditCrop: () => void;
}) {
  if (item?.displayUrl) {
    return (
      <div className={`group relative ${compact ? portalThumbGallery : "w-full"}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={onEditCrop}
          className={`block overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-colors ${
            compact ? `${portalThumbGallery} cursor-pointer hover:border-primary/40` : "w-full"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <PartnerGalleryImage
            src={item.displayUrl}
            alt=""
            fill={false}
            className={compact ? `${portalThumbGallery} rounded-lg` : ""}
            width={compact ? 96 : undefined}
            height={compact ? 120 : undefined}
          />
        </button>
        {!disabled ? (
          <>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove gallery image"
              className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              &times;
            </button>
            {compact ? (
              <div className="mt-1 flex flex-wrap gap-x-2">
                <button type="button" onClick={onReplace} className={portalTextAction}>
                  Replace
                </button>
                <button type="button" onClick={onEditCrop} className={portalTextAction}>
                  Crop
                </button>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={onReplace}
                  className="text-[10px] font-semibold text-white"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={onEditCrop}
                  className="text-[10px] font-semibold text-white"
                >
                  Edit crop
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    );
  }

  const emptyClass = compact
    ? `${portalThumbGallery} rounded-lg border-2 border-dashed`
    : "aspect-[4/5] w-full rounded-lg border-2 border-dashed";

  return (
    <div
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onClick={disabled ? undefined : onReplace}
      onKeyDown={
        disabled
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onReplace();
              }
            }
      }
      aria-disabled={disabled || undefined}
      className={`flex flex-col items-center justify-center border-border bg-surface px-2 text-center transition-colors ${emptyClass} ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
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
      <span className={`font-medium text-foreground ${compact ? "mt-1 text-[10px]" : "mt-2 text-xs"}`}>
        Upload
      </span>
      {!compact ? (
        <span className="mt-0.5 text-[10px] text-muted-foreground">4:5 portrait</span>
      ) : null}
    </div>
  );
}

export function PartnerGalleryUploadGrid({
  items,
  minItems = 0,
  maxItems = 6,
  disabled = false,
  uploading = false,
  onChange,
  onUploadItem,
  className = "",
  variant = "default",
}: PartnerGalleryUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);
  const [initialCrop, setInitialCrop] = useState<GalleryCropSettings>(DEFAULT_GALLERY_CROP);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [reCropMode, setReCropMode] = useState(false);
  const [slotCount, setSlotCount] = useState(() =>
    Math.max(minItems, Math.min(maxItems, Math.max(items.length, minItems || 1)))
  );

  const visibleSlots = Math.max(slotCount, items.length, minItems || 1);

  function closeEditor() {
    revokeIfBlobUrl(editorSrc ?? undefined);
    setEditorSrc(null);
    setPendingOriginalFile(null);
    setEditIndex(null);
    setReCropMode(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker(index: number) {
    if (disabled || uploading) return;
    setEditIndex(index);
    inputRef.current?.click();
  }

  function handleFileSelected(file: File) {
    revokeIfBlobUrl(editorSrc ?? undefined);
    const objectUrl = URL.createObjectURL(file);
    setPendingOriginalFile(file);
    setInitialCrop(DEFAULT_GALLERY_CROP);
    setReCropMode(false);
    setEditorSrc(objectUrl);
  }

  function handleEditCrop(index: number) {
    const item = items[index];
    const src = item?.originalUrl || item?.displayUrl;
    if (!src || disabled || uploading) return;
    revokeIfBlobUrl(editorSrc ?? undefined);
    setEditIndex(index);
    setPendingOriginalFile(null);
    setInitialCrop(item?.crop ?? DEFAULT_GALLERY_CROP);
    setReCropMode(true);
    setEditorSrc(src);
  }

  function handleRemove(index: number) {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
    if (next.length < visibleSlots - 1 && visibleSlots > (minItems || 1)) {
      setSlotCount((count) => Math.max(minItems || 1, count - 1));
    }
  }

  async function handleSave(result: {
    croppedBlob: Blob;
    previewUrl: string;
    crop: GalleryCropSettings;
  }) {
    if (editIndex === null) return;

    const croppedFile = new File([result.croppedBlob], "gallery-display.jpg", {
      type: "image/jpeg",
    });

    const existingOriginalUrl = items[editIndex]?.originalUrl ?? null;

    const uploaded = await onUploadItem({
      croppedFile,
      originalFile: pendingOriginalFile,
      previewUrl: result.previewUrl,
      crop: result.crop,
      recropOnly: reCropMode && !pendingOriginalFile,
      existingOriginalUrl,
    });

    const next = [...items];
    if (editIndex >= next.length) {
      next.push(uploaded);
    } else {
      next[editIndex] = uploaded;
    }
    onChange(next);
    closeEditor();
  }

  const compact = variant === "compact";

  const slots = Array.from({ length: Math.min(visibleSlots, maxItems) }, (_, index) => {
    const item = items[index];
    return (
      <GallerySlot
        key={index}
        item={item}
        compact={compact}
        disabled={disabled || uploading}
        onRemove={() => handleRemove(index)}
        onReplace={() => openFilePicker(index)}
        onEditCrop={() => handleEditCrop(index)}
      />
    );
  });

  return (
    <>
      <div className={compact ? `flex flex-col gap-4 ${className}` : className}>
        <div
          className={
            compact
              ? "flex flex-wrap gap-4"
              : "grid grid-cols-2 gap-3 sm:grid-cols-3"
          }
        >
          {slots}
        </div>

        {!disabled && visibleSlots < maxItems ? (
          <button
            type="button"
            disabled={uploading}
            onClick={() => setSlotCount((count) => Math.min(count + 1, maxItems))}
            className="inline-flex h-9 w-fit items-center gap-1.5 rounded-sm border border-border bg-background px-3 text-[0.8125rem] font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Upload More
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFileSelected(file);
        }}
      />

      {editorSrc ? (
        <GalleryCropEditor
          imageSrc={editorSrc}
          initialCrop={initialCrop}
          onCancel={closeEditor}
          onSave={(result) => void handleSave(result)}
        />
      ) : null}
    </>
  );
}

export type PartnerGalleryDraftItem = PartnerGalleryUploadValue | null;

type PartnerGalleryDraftGridProps = {
  items: PartnerGalleryDraftItem[];
  minItems?: number;
  maxItems?: number;
  disabled?: boolean;
  onChange: (items: PartnerGalleryDraftItem[]) => void;
  className?: string;
  variant?: "default" | "compact";
};

export function PartnerGalleryDraftGrid({
  items,
  minItems = 3,
  maxItems = 6,
  disabled = false,
  onChange,
  className = "",
  variant = "default",
}: PartnerGalleryDraftGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);
  const [initialCrop, setInitialCrop] = useState<GalleryCropSettings>(DEFAULT_GALLERY_CROP);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [reCropMode, setReCropMode] = useState(false);
  const [slotCount, setSlotCount] = useState(() =>
    Math.max(minItems, Math.min(maxItems, Math.max(items.length, minItems)))
  );

  const visibleSlots = Math.max(slotCount, items.filter(Boolean).length, minItems);

  function closeEditor() {
    revokeIfBlobUrl(editorSrc ?? undefined);
    setEditorSrc(null);
    setPendingOriginalFile(null);
    setEditIndex(null);
    setReCropMode(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker(index: number) {
    if (disabled) return;
    setEditIndex(index);
    inputRef.current?.click();
  }

  function handleFileSelected(file: File) {
    revokeIfBlobUrl(editorSrc ?? undefined);
    setPendingOriginalFile(file);
    setInitialCrop(DEFAULT_GALLERY_CROP);
    setReCropMode(false);
    setEditorSrc(URL.createObjectURL(file));
  }

  function handleEditCrop(index: number) {
    const item = items[index];
    if (!item || disabled) return;
    revokeIfBlobUrl(editorSrc ?? undefined);
    setEditIndex(index);
    setPendingOriginalFile(item.originalFile ?? null);
    setInitialCrop(item.crop ?? DEFAULT_GALLERY_CROP);
    setReCropMode(true);
    setEditorSrc(URL.createObjectURL(item.originalFile ?? item.croppedFile));
  }

  function handleRemove(index: number) {
    const next = [...items];
    const existing = next[index];
    if (existing?.previewUrl.startsWith("blob:")) {
      revokeIfBlobUrl(existing.previewUrl);
    }
    next[index] = null;
    onChange(next);
  }

  function handleSave(result: {
    croppedBlob: Blob;
    previewUrl: string;
    crop: GalleryCropSettings;
  }) {
    if (editIndex === null) return;

    const croppedFile = new File([result.croppedBlob], "gallery-display.jpg", {
      type: "image/jpeg",
    });

    const next = [...items];
    const previous = next[editIndex];
    if (previous?.previewUrl.startsWith("blob:")) {
      revokeIfBlobUrl(previous.previewUrl);
    }

    next[editIndex] = {
      croppedFile,
      originalFile: pendingOriginalFile ?? (reCropMode ? previous?.originalFile : null),
      previewUrl: result.previewUrl,
      crop: result.crop,
      recropOnly: reCropMode && !pendingOriginalFile,
    };
    onChange(next);
    closeEditor();
  }

  const compact = variant === "compact";

  const slots = Array.from({ length: Math.min(visibleSlots, maxItems) }, (_, index) => {
    const item = items[index];
    const displayItem = item
      ? { displayUrl: item.previewUrl, originalUrl: null, crop: item.crop }
      : undefined;

    return (
      <GallerySlot
        key={index}
        item={displayItem}
        compact={compact}
        disabled={disabled}
        onRemove={() => handleRemove(index)}
        onReplace={() => openFilePicker(index)}
        onEditCrop={() => handleEditCrop(index)}
      />
    );
  });

  return (
    <>
      <div className={compact ? `flex flex-col gap-4 ${className}` : className}>
        <div
          className={
            compact
              ? "flex flex-wrap gap-4"
              : "grid grid-cols-2 gap-3 sm:grid-cols-3"
          }
        >
          {slots}
        </div>

        {!disabled && visibleSlots < maxItems ? (
          <button
            type="button"
            onClick={() => setSlotCount((count) => Math.min(count + 1, maxItems))}
            className={
              compact
                ? "inline-flex h-9 w-fit items-center gap-1.5 rounded-sm border border-border bg-background px-3 text-[0.8125rem] font-semibold text-foreground transition-colors hover:bg-surface"
                : "inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
            }
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Upload More
          </button>
        ) : visibleSlots >= maxItems ? (
          <p className="text-xs text-muted-foreground">
            Maximum of {maxItems} gallery images reached.
          </p>
        ) : null}
      </div>

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

      {editorSrc ? (
        <GalleryCropEditor
          imageSrc={editorSrc}
          initialCrop={initialCrop}
          onCancel={closeEditor}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}
