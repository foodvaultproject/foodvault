"use client";

import { useEffect, useRef, useState } from "react";
import { GalleryCropEditor } from "@/components/partners/GalleryCropEditor";
import {
  portalCardTitle,
  portalHelper,
  portalTextAction,
  portalThumbGallery,
} from "@/lib/partner-portal-classes";
import {
  DEFAULT_GALLERY_CROP,
  GALLERY_ASPECT,
  GALLERY_OUTPUT_HEIGHT,
  GALLERY_OUTPUT_WIDTH,
  revokeIfBlobUrl,
  type GalleryCropSettings,
} from "@/lib/partner-gallery-crop";
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_SELECTED_PRODUCTS,
  SELECTED_PRODUCT_ADD_INCOMPLETE_MESSAGE,
  calculateMemberPriceLabel,
  createSelectedProductDraft,
  finalizeProductNameInput,
  formatProductNameInput,
  isSelectedProductComplete,
  sanitizePriceValue,
  type SelectedProductDraft,
} from "@/lib/partner-offer";

type SelectedProductsEditorProps = {
  products: SelectedProductDraft[];
  onChange: (products: SelectedProductDraft[]) => void;
  sharedDiscountValue: string;
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
  onUpload,
  onEditCrop,
}: {
  product: SelectedProductDraft;
  disabled?: boolean;
  onUpload: () => void;
  onEditCrop: () => void;
}) {
  const preview = productPreviewUrl(product);

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={preview ? onEditCrop : onUpload}
        className={`flex items-center justify-center overflow-hidden rounded-lg border bg-surface transition-colors ${portalThumbGallery} ${
          preview
            ? "cursor-pointer border-border border-solid shadow-sm hover:border-primary/40"
            : "cursor-pointer border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="px-2 text-center">
            <span className="block text-xs font-semibold text-foreground">Upload</span>
            <span className="mt-1 block text-[10px] text-muted-foreground">4:5 portrait</span>
          </div>
        )}
      </button>
      {preview && !disabled ? (
        <div className="mt-1 flex flex-wrap gap-x-2">
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
  sharedDiscountValue,
  disabled,
  inputClass,
  labelClass,
  helperClass,
  fieldGapClass,
  compact,
  onUpdate,
}: {
  product: SelectedProductDraft;
  sharedDiscountValue: string;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass: string;
  fieldGapClass: string;
  compact?: boolean;
  onUpdate: (next: SelectedProductDraft) => void;
}) {
  const memberPrice = calculateMemberPriceLabel(product.normalPrice, sharedDiscountValue);
  const gapClass = compact ? fieldGapClass : "mt-2";

  return (
    <div className={compact ? "min-w-0 flex-1 space-y-3" : "space-y-4"}>
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
            placeholder={
              sharedDiscountValue ? "Calculated automatically" : "Enter discount above first"
            }
            className={`${gapClass} ${inputClass} bg-surface text-foreground`}
          />
          {sharedDiscountValue ? (
            <p className={`${helperClass} mt-1`}>
              Based on your {sharedDiscountValue}% discount for all selected products.
            </p>
          ) : null}
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

function CollapsedSelectedProduct({
  product,
  index,
  sharedDiscountValue,
  disabled,
  onEdit,
  onDelete,
}: {
  product: SelectedProductDraft;
  index: number;
  sharedDiscountValue: string;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const label = product.name.trim() || `Product ${index + 1}`;
  const memberPrice = calculateMemberPriceLabel(product.normalPrice, sharedDiscountValue);

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="h-10 w-8 shrink-0 rounded object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{label}</p>
          {memberPrice ? (
            <p className="text-xs text-muted-foreground">Member price {memberPrice}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onEdit}
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="rounded-sm border border-red-200 bg-background px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function ProductEditorCard({
  product,
  index,
  sharedDiscountValue,
  disabled,
  inputClass,
  labelClass,
  helperClass,
  fieldGapClass,
  compact,
  onUpdate,
  onUploadImage,
  onEditCrop,
}: {
  product: SelectedProductDraft;
  index: number;
  sharedDiscountValue: string;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass: string;
  fieldGapClass: string;
  compact?: boolean;
  onUpdate: (next: SelectedProductDraft) => void;
  onUploadImage: () => void;
  onEditCrop: () => void;
}) {
  return (
    <article
      className={`rounded-lg border border-border bg-background shadow-sm ${compact ? "p-4" : "p-5"}`}
      data-product-id={product.id}
      data-sort-order={product.sortOrder}
    >
      {index > 0 ? (
        <p className={`${compact ? portalCardTitle : "text-sm font-bold text-foreground"} mb-3`}>
          Product {index + 1}
        </p>
      ) : null}

      {compact ? (
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="shrink-0">
            {!product.imageUrl && !product.imageFile ? (
              <label className={`${labelClass} mb-1.5 block`}>Product Image</label>
            ) : null}
            <ProductImageThumbnail
              product={product}
              disabled={disabled}
              onUpload={onUploadImage}
              onEditCrop={onEditCrop}
            />
          </div>
          <ProductFields
            product={product}
            sharedDiscountValue={sharedDiscountValue}
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Product Image</label>
              <p className={`${helperClass} mt-1`}>4:5 portrait — same ratio as gallery images.</p>
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
            sharedDiscountValue={sharedDiscountValue}
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
  sharedDiscountValue,
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
  const [showIncompleteNote, setShowIncompleteNote] = useState(false);
  const [editingExistingProduct, setEditingExistingProduct] = useState(false);

  useEffect(() => {
    if (!showIncompleteNote) return undefined;
    const timer = window.setTimeout(() => setShowIncompleteNote(false), 4000);
    return () => window.clearTimeout(timer);
  }, [showIncompleteNote]);

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

  function expandProduct(productId: string) {
    setEditingExistingProduct(true);
    onChange(
      products.map((product) => ({
        ...product,
        collapsed: product.id !== productId,
      }))
    );
  }

  function handleConfirmProduct() {
    const activeProduct = products.find((product) => product.collapsed === false);
    if (!activeProduct || !isSelectedProductComplete(activeProduct)) {
      setShowIncompleteNote(true);
      return;
    }

    setShowIncompleteNote(false);
    setEditingExistingProduct(false);
    onChange(
      products.map((product) =>
        product.id === activeProduct.id ? { ...product, collapsed: true } : product
      )
    );
  }

  function handleCancelProduct() {
    const activeProduct = products.find((product) => product.collapsed === false);
    if (!activeProduct || editingExistingProduct) return;

    setShowIncompleteNote(false);
    setEditingExistingProduct(false);
    closeEditor();

    if (activeProduct.imageUrl?.startsWith("blob:")) {
      revokeIfBlobUrl(activeProduct.imageUrl);
    }

    onChange(
      products
        .filter((product) => product.id !== activeProduct.id)
        .map((product, index) => ({ ...product, sortOrder: index }))
    );
  }

  function addProduct() {
    if (products.length >= MAX_SELECTED_PRODUCTS) return;
    if (products.some((product) => product.collapsed === false)) return;

    setEditingExistingProduct(false);
    onChange([...products, createSelectedProductDraft(products.length, { collapsed: false })]);
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

  const collapsedProducts = products.filter((product) => product.collapsed === true);
  const activeProduct =
    products.find((product) => product.collapsed === false) ?? null;
  const activeIndex = activeProduct
    ? products.findIndex((product) => product.id === activeProduct.id)
    : -1;
  const canAddNewProduct =
    !activeProduct && products.length < MAX_SELECTED_PRODUCTS;
  const confirmLabel = editingExistingProduct ? "Save" : "Add";

  return (
    <div className="space-y-3">
      <div>
        <h3 className={compact ? portalCardTitle : "text-sm font-bold text-foreground"}>
          Your Selected Products
        </h3>
        <p className={`${helperClass} mt-0.5`}>
          Add up to {MAX_SELECTED_PRODUCTS} products for this offer. Upload a 4:5 portrait
          image for each product, then add the name, normal price, short description, and
          product link. The discount you entered above applies to every product in this list.
        </p>
      </div>

      <div className="space-y-2">
        {collapsedProducts.map((product) => {
          const index = products.findIndex((entry) => entry.id === product.id);
          return (
            <CollapsedSelectedProduct
              key={product.id}
              product={product}
              index={index}
              sharedDiscountValue={sharedDiscountValue}
              disabled={disabled}
              onEdit={() => expandProduct(product.id)}
              onDelete={() => removeProduct(product.id)}
            />
          );
        })}
      </div>

      {activeProduct ? (
        <div className="space-y-4">
          {products.length > 1 ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product {activeIndex + 1} of {products.length}
            </p>
          ) : null}
          <ProductEditorCard
            product={activeProduct}
            index={activeIndex}
            sharedDiscountValue={sharedDiscountValue}
            disabled={disabled}
            inputClass={inputClass}
            labelClass={labelClass}
            helperClass={helperClass}
            fieldGapClass={fieldGapClass}
            compact={compact}
            onUpdate={(next) => updateProduct(activeProduct.id, next)}
            onUploadImage={() => openFilePicker(activeProduct.id)}
            onEditCrop={() => openCropEditor(activeProduct.id)}
          />
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={handleConfirmProduct}
                className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {confirmLabel}
              </button>
              {!editingExistingProduct ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleCancelProduct}
                  className="inline-flex items-center justify-center rounded-sm border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {showIncompleteNote ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {SELECTED_PRODUCT_ADD_INCOMPLETE_MESSAGE}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {canAddNewProduct ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={addProduct}
            className="inline-flex h-9 items-center rounded-sm border border-primary/30 bg-primary/5 px-4 text-[0.8125rem] font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {products.length === 0 ? "+ Add Product" : "Add new product"}
          </button>
          <p className={helperClass}>
            {products.length} of {MAX_SELECTED_PRODUCTS} products
          </p>
        </div>
      ) : products.length >= MAX_SELECTED_PRODUCTS && !activeProduct ? (
        <p className={helperClass}>
          Maximum of {MAX_SELECTED_PRODUCTS} products reached.
        </p>
      ) : null}

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
          aspect={GALLERY_ASPECT}
          outputWidth={GALLERY_OUTPUT_WIDTH}
          outputHeight={GALLERY_OUTPUT_HEIGHT}
          title="Adjust Product Image"
          description="Drag and zoom your image inside the 4:5 portrait frame. This is how it will appear on your brand profile."
          onCancel={closeEditor}
          onSave={handleSaveCrop}
        />
      ) : null}
    </div>
  );
}
