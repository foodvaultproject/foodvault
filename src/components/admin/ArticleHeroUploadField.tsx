"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArticleHeroCropEditor } from "@/components/admin/ArticleHeroCropEditor";
import {
  DEFAULT_ARTICLE_HERO_CROP,
  revokeIfBlobUrl,
  type ArticleHeroCropSettings,
} from "@/lib/article-hero-crop";
import { uploadArticleHeroAction } from "@/lib/admin/actions";

type ArticleHeroUploadFieldProps = {
  heroUrl: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

const THUMB_CLASS = "relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-lg";

export function ArticleHeroUploadField({
  heroUrl,
  onChange,
  onError,
  disabled = false,
}: ArticleHeroUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [initialCrop, setInitialCrop] = useState<ArticleHeroCropSettings>(
    DEFAULT_ARTICLE_HERO_CROP
  );
  const [uploading, setUploading] = useState(false);

  const displayUrl = previewUrl ?? heroUrl;

  function openFilePicker() {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }

  function handleFileSelected(file: File) {
    revokeIfBlobUrl(editorSrc ?? undefined);
    setInitialCrop(DEFAULT_ARTICLE_HERO_CROP);
    setEditorSrc(URL.createObjectURL(file));
  }

  function handleEditCrop() {
    if (!displayUrl || disabled || uploading) return;
    revokeIfBlobUrl(editorSrc ?? undefined);
    setInitialCrop(DEFAULT_ARTICLE_HERO_CROP);
    setEditorSrc(displayUrl);
  }

  function closeEditor() {
    revokeIfBlobUrl(editorSrc ?? undefined);
    setEditorSrc(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleRemove() {
    revokeIfBlobUrl(previewUrl ?? undefined);
    setPreviewUrl(null);
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleConfirm(result: {
    croppedBlob: Blob;
    previewUrl: string;
    crop: ArticleHeroCropSettings;
  }) {
    const croppedFile = new File([result.croppedBlob], "article-hero.jpg", {
      type: "image/jpeg",
    });

    setUploading(true);
    onError("");

    try {
      const fd = new FormData();
      fd.set("file", croppedFile);
      const uploadResult = await uploadArticleHeroAction(fd);

      if (uploadResult.error) {
        onError(uploadResult.error);
        revokeIfBlobUrl(result.previewUrl);
        return;
      }

      revokeIfBlobUrl(previewUrl ?? undefined);
      setPreviewUrl(result.previewUrl);
      onChange(uploadResult.url ?? result.previewUrl);
      closeEditor();
    } catch {
      onError("Failed to upload hero image.");
      revokeIfBlobUrl(result.previewUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start gap-4">
        {displayUrl ? (
          <div className={`${THUMB_CLASS} border border-border bg-page`}>
            <Image
              src={displayUrl}
              alt="Article hero thumbnail"
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-semibold text-white">
                Uploading...
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled || uploading}
            className={`${THUMB_CLASS} flex flex-col items-center justify-center border-2 border-dashed border-border bg-page text-muted transition-colors ${
              disabled || uploading
                ? "cursor-not-allowed opacity-60"
                : "hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <svg
              className="h-5 w-5"
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
            <span className="mt-1 text-[10px] font-semibold">Upload</span>
          </button>
        )}

        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <p className="text-xs text-muted">
            4:5 portrait · 1080×1350 px. Matches homepage Discover tiles.
          </p>

          {displayUrl && !disabled ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="text-xs font-semibold text-primary disabled:opacity-60"
              >
                Replace image
              </button>
              <button
                type="button"
                onClick={handleEditCrop}
                disabled={uploading}
                className="text-xs font-semibold text-primary disabled:opacity-60"
              >
                Adjust crop
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="text-xs font-semibold text-red-600 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ) : !displayUrl ? (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={disabled || uploading}
              className="text-xs font-semibold text-primary disabled:opacity-60"
            >
              Choose image
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
      </div>

      {editorSrc ? (
        <ArticleHeroCropEditor
          imageSrc={editorSrc}
          initialCrop={initialCrop}
          onCancel={closeEditor}
          onConfirm={handleConfirm}
        />
      ) : null}
    </>
  );
}
