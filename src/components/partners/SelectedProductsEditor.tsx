"use client";

import { useRef, useState } from "react";
import { GalleryCropEditor } from "@/components/partners/GalleryCropEditor";
import {
  portalCardTitle,
  portalHelper,
  portalTextAction,
  portalThumbGallery,
} from "@/lib/partner-portal-classes";
import {
  DEFAULT_GALLERY_CROP,
  PRODUCT_ASPECT,
  PRODUCT_OUTPUT_SIZE,
  revokeIfBlobUrl,
  type GalleryCropSettings,
} from "@/lib/partner-gallery-crop";
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_SELECTED_PRODUCTS,
  calculateMemberPriceLabel,
  createSelectedProductDraft,
  finalizeProductNameInput,
  formatProductNameInput,
  sanitizeDiscountValue,
  sanitizePriceValue,
  type SelectedProductDraft,
} from "@/lib/partner-offer";

type SelectedProductsEditorProps = {
  products: SelectedProductDraft[];
  onChange: (products: SelectedProductDraft[]) => void;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass?: string;
  fieldGapClass?: string;
  compact?: boolean;
};

function productPreviewUrl(product: SelectedProductDraft): string | null {
  return product.imageUrl;
}

function ProductImageThumbnail({
  product,
  disabled,
  compact,
  onUpload,
  onEditCrop,
}: {
  product: SelectedProductDraft;
  disabled?: boolean;
  compact?: boolean;
  onUpload: () => void;
  onEditCrop: () => void;
}) {
  const preview = productPreviewUrl(product);
  const thumbClass = compact ? portalThumbGallery : "h-36 w-36";

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={preview ? onEditCrop : onUpload}
        className={`flex items-center justify-center overflow-hidden rounded-lg border bg-surface transition-colors ${thumbClass} ${
          preview
            ? "cursor-pointer border-border border-solid shadow-sm hover:border-primary/40"
            : "cursor-pointer border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="px-2 text-center">
            <span className="block text-xs font-semibold text-foreground">Upload</span>
            <span className="mt-1 block text-[10px] text-muted-foreground">Required</span>
          </div>
        )}
      </button>
      {preview && !disabled ? (
        <div className={`mt-1 flex flex-wrap gap-x-2 ${compact ? "" : "gap-2"}`}>
          <button type="button" onClick={onUpload} className={portalTextAction}>
            Replace
          </button>
          <button type="button" onClick={onEditCrop} className={portalTextAction}>
            Adjust
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProductFields({
  product,
  disabled,
  inputClass,
  labelClass,
  helperClass,
  fieldGapClass,
  compact,
  onUpdate,
}: {
  product: SelectedProductDraft;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass: string;
  fieldGapClass: string;
  compact?: boolean;
  onUpdate: (next: SelectedProductDraft) => void;
}) {
  const memberPrice = calculateMemberPriceLabel(product.normalPrice, product.discountValue);
  const gapClass = compact ? fieldGapClass : "mt-2";

  return (
    <div className={compact ? "min-w-0 flex-1 space-y-3" : "space-y-4"}>
      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "space-y-4"}>
        <div>
          <label className={labelClass}>Product Name</label>
          <input
            type="text"
            required
            maxLength={MAX_PRODUCT_NAME_LENGTH}
            disabled={disabled}
            value={product.name}
            onChange={(event) =>
              onUpdate({
                ...product,
                name: formatProductNameInput(event.target.value),
              })
            }
            onBlur={() =>
              onUpdate({
                ...product,
                name: finalizeProductNameInput(product.name),
              })
            }
            className={`${gapClass} ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass}>Discount Value</label>
          <div className={`relative max-w-[140px] ${gapClass}`}>
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={2}
              disabled={disabled}
              value={product.discountValue}
              onChange={(event) =>
                onUpdate({
                  ...product,
                  discountValue: sanitizeDiscountValue(event.target.value),
                })
              }
              className={`${inputClass} pr-10`}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>
      </div>

      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className={labelClass}>Normal Price</label>
          <div className={`relative max-w-[180px] ${gapClass}`}>
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              required
              disabled={disabled}
              value={product.normalPrice}
              onChange={(event) =>
                onUpdate({
                  ...product,
                  normalPrice: sanitizePriceValue(event.target.value),
                })
              }
              placeholder="0.00"
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Member Price</label>
          <input
            type="text"
            readOnly
            value={memberPrice}
            placeholder="Calculated automatically"
            className={`${gapClass} ${inputClass} bg-surface text-foreground`}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Short Description
          <span className="ml-1 font-normal text-muted-foreground">
            (max {MAX_PRODUCT_DESCRIPTION_LENGTH})
          </span>
        </label>
        <input
          type="text"
          required
          maxLength={MAX_PRODUCT_DESCRIPTION_LENGTH}
          disabled={disabled}
          value={product.shortDescription}
          onChange={(event) =>
            onUpdate({ ...product, shortDescription: event.target.value })
          }
          className={`${gapClass} ${inputClass}`}
        />
        <p className={`${helperClass} mt-1`}>
          {product.shortDescription.length}/{MAX_PRODUCT_DESCRIPTION_LENGTH}
        </p>
      </div>

      <div>
        <label className={labelClass}>Product URL</label>
        <input
          type="url"
          required
          disabled={disabled}
          value={product.productUrl}
          onChange={(event) => onUpdate({ ...product, productUrl: event.target.value })}
          placeholder="https://yourstore.com/product"
          className={`${gapClass} ${inputClass}`}
        />
        {!compact ? (
          <p className={`${helperClass} mt-1`}>
            Direct link on your website. Members go here when they click View Product.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ProductEditorCard({
  product,
  index,
  disabled,
  inputClass,
  labelClass,
  helperClass,
  fieldGapClass,
  compact,
  onUpdate,
  onRemove,
  onUploadImage,
  onEditCrop,
}: {
  product: SelectedProductDraft;
  index: number;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass: string;
  fieldGapClass: string;
  compact?: boolean;
  onUpdate: (next: SelectedProductDraft) => void;
  onRemove: () => void;
  onUploadImage: () => void;
  onEditCrop: () => void;
}) {
  return (
    <article
      className={`rounded-lg border border-border bg-background shadow-sm ${compact ? "p-4" : "p-5"}`}
      data-product-id={product.id}
      data-sort-order={product.sortOrder}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={compact ? portalCardTitle : "text-sm font-bold text-foreground"}>
          Product {index + 1}
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="text-[0.8125rem] font-semibold text-red-600 transition-colors hover:text-red-700 disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      {compact ? (
        <div className="mt-3 flex flex-col gap-4 lg:flex-row">
          <div className="shrink-0">
            {!product.imageUrl && !product.imageFile ? (
              <label className={`${labelClass} mb-1.5 block`}>Product Image</label>
            ) : null}
            <ProductImageThumbnail
              product={product}
              disabled={disabled}
              compact={compact}
              onUpload={onUploadImage}
              onEditCrop={onEditCrop}
            />
          </div>
          <ProductFields
            product={product}
            disabled={disabled}
            inputClass={inputClass}
            labelClass={labelClass}
            helperClass={helperClass}
            fieldGapClass={fieldGapClass}
            compact={compact}
            onUpdate={onUpdate}
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Product Image</label>
              <div className="mt-2">
                <ProductImageThumbnail
                  product={product}
                  disabled={disabled}
                  onUpload={onUploadImage}
                  onEditCrop={onEditCrop}
                />
              </div>
            </div>
          </div>
          <ProductFields
            product={product}
            disabled={disabled}
            inputClass={inputClass}
            labelClass={labelClass}
            helperClass={helperClass}
            fieldGapClass={fieldGapClass}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </article>
  );
}

export function SelectedProductsEditor({
  products,
  onChange,
  disabled = false,
  inputClass,
  labelClass,
  helperClass = "text-xs leading-snug text-muted-foreground",
  fieldGapClass = "mt-1",
  compact = false,
}: SelectedProductsEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [initialCrop, setInitialCrop] = useState<GalleryCropSettings>(DEFAULT_GALLERY_CROP);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [reCropMode, setReCropMode] = useState(false);

  function updateProduct(id: string, next: SelectedProductDraft) {
    onChange(products.map((product) => (product.id === id ? next : product)));
  }

  function removeProduct(id: string) {
    onChange(
      products
        .filter((product) => product.id !== id)
        .map((product, index) => ({ ...product, sortOrder: index }))
    );
  }

  function addProduct() {
    if (products.length >= MAX_SELECTED_PRODUCTS) return;
    onChange([...products, createSelectedProductDraft(products.length)]);
  }

  function closeEditor(keepSrc?: string | null) {
    if (editorSrc && editorSrc !== keepSrc) {
      revokeIfBlobUrl(editorSrc);
    }
    setEditorSrc(null);
    setPendingOriginalFile(null);
    setEditingProductId(null);
    setReCropMode(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker(productId: string) {
    if (disabled) return;
    setEditingProductId(productId);
    inputRef.current?.click();
  }

  function openCropEditor(productId: string) {
    if (disabled) return;
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const src = product.imageOriginalUrl || product.imageUrl;
    if (!src) {
      openFilePicker(productId);
      return;
    }

    revokeIfBlobUrl(editorSrc ?? undefined);
    setEditingProductId(productId);
    setPendingOriginalFile(null);
    setInitialCrop(product.imageCrop ?? DEFAULT_GALLERY_CROP);
    setReCropMode(true);
    setEditorSrc(src);
  }

  function handleFileSelected(file: File) {
    if (!editingProductId) return;
    revokeIfBlobUrl(editorSrc ?? undefined);
    const objectUrl = URL.createObjectURL(file);
    setPendingOriginalFile(file);
    setInitialCrop(DEFAULT_GALLERY_CROP);
    setReCropMode(false);
    setEditorSrc(objectUrl);
  }

  function handleSaveCrop(result: {
    croppedBlob: Blob;
    previewUrl: string;
    crop: GalleryCropSettings;
  }) {
    if (!editingProductId) return;

    const product = products.find((item) => item.id === editingProductId);
    if (!product) return;

    const croppedFile = new File([result.croppedBlob], "product-display.jpg", {
      type: "image/jpeg",
    });

    const originalUrl = pendingOriginalFile
      ? editorSrc
      : product.imageOriginalUrl ?? product.imageUrl;

    if (product.imageUrl?.startsWith("blob:") && product.imageUrl !== originalUrl) {
      revokeIfBlobUrl(product.imageUrl);
    }

    updateProduct(editingProductId, {
      ...product,
      imageFile: croppedFile,
      imageUrl: result.previewUrl,
      imageOriginalUrl: originalUrl,
      imageCrop: result.crop,
    });
    closeEditor(originalUrl);
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className={compact ? portalCardTitle : "text-sm font-bold text-foreground"}>
          Selected Products
        </h3>
        <p className={`${helperClass} mt-0.5`}>
          Add the products that this member offer applies to. Each product can have its own
          image, description, direct product link and individual member discount.
        </p>
      </div>

      {products.map((product, index) => (
        <ProductEditorCard
          key={product.id}
          product={product}
          index={index}
          disabled={disabled}
          inputClass={inputClass}
          labelClass={labelClass}
          helperClass={helperClass}
          fieldGapClass={fieldGapClass}
          compact={compact}
          onUpdate={(next) => updateProduct(product.id, next)}
          onRemove={() => removeProduct(product.id)}
          onUploadImage={() => openFilePicker(product.id)}
          onEditCrop={() => openCropEditor(product.id)}
        />
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || products.length >= MAX_SELECTED_PRODUCTS}
          onClick={addProduct}
          className="inline-flex h-9 items-center rounded-sm border border-border bg-background px-3 text-[0.8125rem] font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Add Product
        </button>
        <p className={helperClass}>
          {products.length} of {MAX_SELECTED_PRODUCTS} products
        </p>
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
          event.target.value = "";
        }}
      />

      {editorSrc ? (
        <GalleryCropEditor
          imageSrc={editorSrc}
          initialCrop={initialCrop}
          aspect={PRODUCT_ASPECT}
          outputWidth={PRODUCT_OUTPUT_SIZE}
          outputHeight={PRODUCT_OUTPUT_SIZE}
          title="Adjust Product Image"
          description="Drag and zoom your image inside the square frame. This is how it will appear on your brand profile."
          onCancel={closeEditor}
          onSave={handleSaveCrop}
        />
      ) : null}
    </div>
  );
}
