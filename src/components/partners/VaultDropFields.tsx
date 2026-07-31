"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PartnerGalleryDraftGrid,
  type PartnerGalleryDraftItem,
} from "@/components/partners/PartnerGalleryUploadGrid";
import {
  VAULT_DROP_ADD_PRODUCT_INCOMPLETE_MESSAGE,
  VAULT_DROP_DURATION_OPTIONS,
  VAULT_DROP_MAX_DESCRIPTION_LENGTH,
  VAULT_DROP_MAX_IMAGES_PER_PRODUCT,
  VAULT_DROP_MAX_PRODUCTS,
  VAULT_DROP_MIN_DISCOUNT_PERCENT,
  VAULT_DROP_REASONS,
  VAULT_DROP_SECTION_INTRO,
  createVaultDropProductDraft,
  finalizeVaultDropDescription,
  finalizeVaultDropTitle,
  formatCalculatedClearancePrice,
  isVaultDropProductComplete,
  sanitizePriceInput,
  sanitizeVaultDropDescription,
  sanitizeVaultDropDiscount,
  sanitizeVaultDropTitleInput,
  validateVaultDropDiscountInput,
  type VaultDropFormDraft,
  type VaultDropProductDraft,
} from "@/lib/vault-drop";

type VaultDropFieldsProps = {
  value: VaultDropFormDraft;
  onChange: (value: VaultDropFormDraft) => void;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass?: string;
  fieldGapClass?: string;
  idPrefix?: string;
  scrollAnchorId?: string;
};

function VaultDropProductForm({
  product,
  disabled,
  inputClass,
  labelClass,
  helperClass,
  fieldGapClass,
  idPrefix,
  onChange,
}: {
  product: VaultDropProductDraft;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass: string;
  fieldGapClass: string;
  idPrefix: string;
  onChange: (product: VaultDropProductDraft) => void;
}) {
  const clearancePrice = useMemo(
    () => formatCalculatedClearancePrice(product.originalPrice, product.discountPercent),
    [product.originalPrice, product.discountPercent]
  );

  const discountError = product.discountPercent
    ? validateVaultDropDiscountInput(product.discountPercent)
    : null;

  const galleryItems = useMemo(
    () =>
      Array.from({ length: Math.max(1, product.images.length || 1) }, (_, slotIndex) =>
        product.images[slotIndex] ?? null
      ),
    [product.images]
  );

  function patch(partial: Partial<VaultDropProductDraft>) {
    onChange({ ...product, ...partial });
  }

  function handleGalleryChange(items: PartnerGalleryDraftItem[]) {
    patch({ images: items.filter(Boolean) as PartnerGalleryDraftItem[] });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-title-${product.id}`} className={labelClass}>
          Offer Title <span className="text-red-600">*</span>
        </label>
        <input
          id={`${idPrefix}-title-${product.id}`}
          type="text"
          maxLength={120}
          disabled={disabled}
          value={product.title}
          onChange={(event) => patch({ title: sanitizeVaultDropTitleInput(event.target.value) })}
          onBlur={(event) => patch({ title: finalizeVaultDropTitle(event.target.value) })}
          placeholder="e.g. Clearance Protein Bars"
          className={`${inputClass} ${fieldGapClass}`}
        />
        <p className={`${helperClass} mt-1`}>Each word is automatically capitalised.</p>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-description-${product.id}`} className={labelClass}>
          Description <span className="text-red-600">*</span>
        </label>
        <textarea
          id={`${idPrefix}-description-${product.id}`}
          rows={3}
          maxLength={VAULT_DROP_MAX_DESCRIPTION_LENGTH}
          disabled={disabled}
          value={product.description}
          onChange={(event) =>
            patch({ description: sanitizeVaultDropDescription(event.target.value) })
          }
          onBlur={(event) =>
            patch({ description: finalizeVaultDropDescription(event.target.value) })
          }
          placeholder="Tell members what makes this clearance offer special."
          className={`${inputClass} ${fieldGapClass} min-h-[5rem] resize-y`}
        />
        <p className={`${helperClass} mt-1`}>
          {product.description.length}/{VAULT_DROP_MAX_DESCRIPTION_LENGTH} characters
        </p>
      </div>

      <div>
        <span className={labelClass}>
          Product Photos <span className="text-red-600">*</span>
        </span>
        <p className={`${helperClass} mt-1`}>
          Upload up to {VAULT_DROP_MAX_IMAGES_PER_PRODUCT} photos. Images can be cropped and zoomed
          like your gallery uploads. Multiple photos will rotate on the homepage card.
        </p>
        <div className={fieldGapClass}>
          <PartnerGalleryDraftGrid
            items={galleryItems}
            minItems={1}
            maxItems={VAULT_DROP_MAX_IMAGES_PER_PRODUCT}
            disabled={disabled}
            onChange={handleGalleryChange}
            variant="compact"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-original-price-${product.id}`} className={labelClass}>
          Original Price (NZD) <span className="text-red-600">*</span>
        </label>
        <input
          id={`${idPrefix}-original-price-${product.id}`}
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={product.originalPrice}
          onChange={(event) =>
            patch({ originalPrice: sanitizePriceInput(event.target.value) })
          }
          placeholder="49.99"
          className={`${inputClass} ${fieldGapClass} max-w-xs`}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-discount-${product.id}`} className={labelClass}>
          Discount <span className="text-red-600">*</span>
        </label>
        <div className={`relative max-w-xs ${fieldGapClass}`}>
          <input
            id={`${idPrefix}-discount-${product.id}`}
            type="text"
            inputMode="numeric"
            maxLength={2}
            disabled={disabled}
            value={product.discountPercent}
            onChange={(event) =>
              patch({ discountPercent: sanitizeVaultDropDiscount(event.target.value) })
            }
            placeholder="35"
            className={`${inputClass} pr-10`}
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.9375rem] text-muted-foreground">
            %
          </span>
        </div>
        <p className={`${helperClass} mt-1`}>
          Vault Drop offers require a minimum {VAULT_DROP_MIN_DISCOUNT_PERCENT}% discount for
          members.
        </p>
        {discountError ? (
          <p className="mt-1 text-xs font-medium text-red-600">{discountError}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-clearance-price-${product.id}`} className={labelClass}>
          Clearance Price (NZD) <span className="text-red-600">*</span>
        </label>
        <input
          id={`${idPrefix}-clearance-price-${product.id}`}
          type="text"
          readOnly
          value={clearancePrice ? `$${clearancePrice}` : ""}
          placeholder="Calculated automatically"
          className={`${inputClass} ${fieldGapClass} max-w-xs bg-muted/60`}
        />
        <p className={`${helperClass} mt-1`}>
          Calculated from your original price and discount.
        </p>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-reason-${product.id}`} className={labelClass}>
          Reason Tag <span className="text-red-600">*</span>
        </label>
        <select
          id={`${idPrefix}-reason-${product.id}`}
          disabled={disabled}
          value={product.reasonTag}
          onChange={(event) =>
            patch({
              reasonTag: event.target.value as VaultDropProductDraft["reasonTag"],
            })
          }
          className={`${inputClass} ${fieldGapClass} max-w-md`}
        >
          <option value="">Select a reason</option>
          {VAULT_DROP_REASONS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-store-link-${product.id}`} className={labelClass}>
          Direct Store Link <span className="text-red-600">*</span>
        </label>
        <input
          id={`${idPrefix}-store-link-${product.id}`}
          type="url"
          disabled={disabled}
          value={product.directStoreLink}
          onChange={(event) => patch({ directStoreLink: event.target.value })}
          placeholder="https://yourstore.com/products/clearance-item"
          className={`${inputClass} ${fieldGapClass}`}
        />
        <p className={`${helperClass} mt-1`}>
          Link directly to this product on your website so members can buy straight away.
        </p>
      </div>
    </div>
  );
}

function CollapsedVaultDropProduct({
  product,
  index,
  disabled,
  onEdit,
  onDelete,
}: {
  product: VaultDropProductDraft;
  index: number;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const label = product.title.trim() || `Product ${index + 1}`;

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{label}</p>
        {product.discountPercent ? (
          <p className="text-xs text-muted-foreground">{product.discountPercent}% off</p>
        ) : null}
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

export function VaultDropFields({
  value,
  onChange,
  disabled = false,
  inputClass,
  labelClass,
  helperClass = "text-xs text-muted-foreground",
  fieldGapClass = "mt-1.5",
  idPrefix = "vault-drop",
  scrollAnchorId,
}: VaultDropFieldsProps) {
  const [showIncompleteNote, setShowIncompleteNote] = useState(false);

  useEffect(() => {
    if (!showIncompleteNote) return undefined;
    const timer = window.setTimeout(() => setShowIncompleteNote(false), 4000);
    return () => window.clearTimeout(timer);
  }, [showIncompleteNote]);

  function scrollToVaultDropSection() {
    const anchorId = scrollAnchorId ?? `${idPrefix}-section-top`;
    document.getElementById(anchorId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function patchForm(partial: Partial<VaultDropFormDraft>) {
    onChange({ ...value, ...partial });
  }

  function updateProduct(productId: string, product: VaultDropProductDraft) {
    patchForm({
      products: value.products.map((entry) => (entry.id === productId ? product : entry)),
    });
  }

  function expandProduct(productId: string) {
    patchForm({
      products: value.products.map((entry) => ({
        ...entry,
        collapsed: entry.id !== productId,
      })),
    });
  }

  function handleDeleteProduct(productId: string) {
    patchForm({
      products: value.products.filter((entry) => entry.id !== productId),
    });
  }

  function handleConfirmProduct() {
    const editingProduct = value.products.find((product) => !product.collapsed);
    if (!editingProduct || !isVaultDropProductComplete(editingProduct)) {
      setShowIncompleteNote(true);
      return;
    }

    setShowIncompleteNote(false);
    patchForm({
      products: value.products.map((entry) =>
        entry.id === editingProduct.id ? { ...entry, collapsed: true } : entry
      ),
    });

    window.requestAnimationFrame(() => {
      scrollToVaultDropSection();
    });
  }

  function handleAddNewProduct() {
    if (value.products.length >= VAULT_DROP_MAX_PRODUCTS) return;
    if (value.products.some((product) => !product.collapsed)) return;

    patchForm({
      products: [...value.products, createVaultDropProductDraft({ collapsed: false })],
    });
  }

  const activeProduct = value.products.find((product) => !product.collapsed) ?? null;
  const activeIndex = activeProduct
    ? value.products.findIndex((product) => product.id === activeProduct.id)
    : -1;
  const collapsedProducts = value.products.filter((product) => product.collapsed);
  const canAddNewProduct =
    !activeProduct && value.products.length < VAULT_DROP_MAX_PRODUCTS;

  return (
    <div id={`${idPrefix}-section-top`} className="space-y-4 scroll-mt-24">
      <p
        className={`${helperClass} rounded-md border border-primary/15 bg-primary/5 px-3 py-2.5 text-[0.8125rem] leading-relaxed text-foreground`}
      >
        {VAULT_DROP_SECTION_INTRO}
      </p>

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={value.enabled}
          disabled={disabled}
          onChange={(event) => patchForm({ enabled: event.target.checked })}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
        />
        <span className="text-sm text-foreground">
          Create Vault Drop offers for this listing
        </span>
      </label>

      {value.enabled ? (
        <div className="space-y-4 rounded-md border border-border/80 bg-background/80 p-3 sm:p-4">
          <div>
            <label htmlFor={`${idPrefix}-duration`} className={labelClass}>
              Run Duration <span className="text-red-600">*</span>
            </label>
            <select
              id={`${idPrefix}-duration`}
              disabled={disabled}
              value={value.durationDays}
              onChange={(event) =>
                patchForm({
                  durationDays: Number(event.target.value) as VaultDropFormDraft["durationDays"],
                })
              }
              className={`${inputClass} ${fieldGapClass} max-w-xs`}
            >
              {VAULT_DROP_DURATION_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  {days} {days === 1 ? "day" : "days"}
                </option>
              ))}
            </select>
            <p className={`${helperClass} mt-1`}>
              Applies to all Vault Drop products. Maximum run time is 7 days.
            </p>
          </div>

          {collapsedProducts.map((product) => {
              const index = value.products.findIndex((entry) => entry.id === product.id);
              return (
                <CollapsedVaultDropProduct
                  key={product.id}
                  product={product}
                  index={index}
                  disabled={disabled}
                  onEdit={() => expandProduct(product.id)}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              );
            })}

          {activeProduct ? (
            <div className="rounded-md border border-border bg-background p-3 sm:p-4">
              {value.products.length > 1 ? (
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Product {activeIndex + 1} of {value.products.length}
                </p>
              ) : null}
              <VaultDropProductForm
                product={activeProduct}
                disabled={disabled}
                inputClass={inputClass}
                labelClass={labelClass}
                helperClass={helperClass}
                fieldGapClass={fieldGapClass}
                idPrefix={idPrefix}
                onChange={(product) => updateProduct(product.id, product)}
              />
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleConfirmProduct}
                  className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  Add
                </button>
                {showIncompleteNote ? (
                  <p className="text-xs font-medium text-red-600" role="alert">
                    {VAULT_DROP_ADD_PRODUCT_INCOMPLETE_MESSAGE}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {canAddNewProduct ? (
            <button
              type="button"
              disabled={disabled}
              onClick={handleAddNewProduct}
              className="inline-flex items-center justify-center rounded-sm border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add new product
            </button>
          ) : value.products.length >= VAULT_DROP_MAX_PRODUCTS && !activeProduct ? (
            <p className={helperClass}>
              Maximum of {VAULT_DROP_MAX_PRODUCTS} Vault Drop products reached.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
