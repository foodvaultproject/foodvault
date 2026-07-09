"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  portalCardTitle,
  portalHelper,
  portalTextAction,
  portalThumbGallery,
} from "@/lib/partner-portal-classes";
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_SELECTED_PRODUCTS,
  createSelectedProductDraft,
  sanitizeDiscountValue,
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
  if (product.imageFile) {
    return URL.createObjectURL(product.imageFile);
  }
  return product.imageUrl;
}

function ProductImageField({
  product,
  disabled,
  compact,
  onPick,
}: {
  product: SelectedProductDraft;
  disabled?: boolean;
  compact?: boolean;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = productPreviewUrl(product);

  if (compact) {
    return (
      <div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={`overflow-hidden rounded-lg border-2 border-dashed border-border bg-surface transition-colors ${portalThumbGallery} flex flex-col items-center justify-center ${
            preview ? "border-border border-solid shadow-sm" : ""
          } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/40 hover:bg-primary/5"}`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <>
              <span className="text-[10px] font-semibold text-foreground">Upload</span>
              <span className="text-[10px] text-muted-foreground">Required</span>
            </>
          )}
        </button>
        {preview && !disabled ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`${portalTextAction} mt-1`}
          >
            Replace
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onPick(file);
            event.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={`flex h-36 w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-surface text-center transition-colors ${
          disabled ? "cursor-not-allowed opacity-60" : "hover:border-primary/40 hover:bg-primary/5"
        }`}
      >
        {preview ? (
          <div className="relative h-full w-full">
            <Image src={preview} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <>
            <span className="text-xs font-semibold text-foreground">Upload product image</span>
            <span className="mt-1 text-xs text-muted-foreground">Required</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          event.target.value = "";
        }}
      />
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
}) {
  const imageField = (
    <ProductImageField
      product={product}
      disabled={disabled}
      compact={compact}
      onPick={(file) => onUpdate({ ...product, imageFile: file, imageUrl: null })}
    />
  );

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
            {imageField}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Product Name</label>
                <input
                  type="text"
                  required
                  disabled={disabled}
                  value={product.name}
                  onChange={(event) => onUpdate({ ...product, name: event.target.value })}
                  className={`${fieldGapClass} ${inputClass}`}
                />
              </div>
              <div>
                <label className={labelClass}>Discount Value</label>
                <div className={`relative max-w-[120px] ${fieldGapClass}`}>
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
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.9375rem] text-muted-foreground">
                    %
                  </span>
                </div>
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
                className={`${fieldGapClass} ${inputClass}`}
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
                onChange={(event) =>
                  onUpdate({ ...product, productUrl: event.target.value })
                }
                placeholder="https://yourstore.com/product"
                className={`${fieldGapClass} ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass}>Optional Conditions</label>
              <textarea
                rows={2}
                disabled={disabled}
                value={product.conditions}
                onChange={(event) =>
                  onUpdate({ ...product, conditions: event.target.value })
                }
                placeholder="Minimum purchase, limited time, maximum quantity…"
                className={`${fieldGapClass} min-h-[4.5rem] w-full resize-y rounded-md border border-border bg-background px-3.5 py-2 text-[0.9375rem] leading-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Product Image</label>
              <div className="mt-2">{imageField}</div>
            </div>
            <div>
              <label className={labelClass}>Product Name</label>
              <input
                type="text"
                required
                disabled={disabled}
                value={product.name}
                onChange={(event) => onUpdate({ ...product, name: event.target.value })}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass}>
                Short Description
                <span className="ml-1 font-normal text-muted-foreground">
                  (max {MAX_PRODUCT_DESCRIPTION_LENGTH} characters)
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
                className={`mt-2 ${inputClass}`}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {product.shortDescription.length}/{MAX_PRODUCT_DESCRIPTION_LENGTH}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Product URL</label>
              <input
                type="url"
                required
                disabled={disabled}
                value={product.productUrl}
                onChange={(event) =>
                  onUpdate({ ...product, productUrl: event.target.value })
                }
                placeholder="https://yourstore.com/product"
                className={`mt-2 ${inputClass}`}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Direct link on your website. Members go here when they click View Product.
              </p>
            </div>
            <div>
              <label className={labelClass}>Discount Value</label>
              <div className="relative mt-2 max-w-[140px]">
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
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Optional Conditions</label>
              <textarea
                rows={3}
                disabled={disabled}
                value={product.conditions}
                onChange={(event) =>
                  onUpdate({ ...product, conditions: event.target.value })
                }
                placeholder="Minimum purchase, limited time, maximum quantity…"
                className={`mt-2 resize-y ${inputClass}`}
              />
            </div>
          </div>
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
    </div>
  );
}
