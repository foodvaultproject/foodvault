"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  VAULT_MARKET_DEPARTMENTS,
  getVaultMarketDepartmentNode,
  getVaultMarketSpecifics,
  getVaultMarketSubcategories,
} from "@/data/vault-market-categories";
import { convertImageToWebpFile } from "@/lib/admin/compress-image-webp";
import {
  parseVaultMarketNipImageAction,
  parseVaultMarketNipTextAction,
  saveVaultMarketProductFamilyAction,
  uploadVaultMarketImageAction,
} from "@/lib/admin/pantry-actions";
import {
  NIP_NUTRIENTS,
  calcGrossProfit,
  calcMultibuyGrossProfit,
  formatAutoUnitPriceLabel,
  inferPackAmount,
  inferUnitKind,
  invalidMultibuyPriceMessage,
  isMultibuyPriceAtOrAboveMemberTotal,
  MULTIBUY_SAVE_BLOCKED_MESSAGE,
  nipFromFacts,
  type NipNutrientKey,
  type UnitKind,
} from "@/lib/admin/pantry-shared";
import {
  emptyVariantDraft,
  validateProductFamilyInput,
  variantTabLabel,
  type ProductVariantDraft,
} from "@/lib/admin/product-family";
import { slugifyTitle } from "@/lib/admin/types";
import type { FoodVaultProduct } from "@/types/commerce";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";
const sectionClass = "rounded border border-border bg-white p-5 sm:p-6";
const thumbClass = "h-20 w-20 rounded-md border border-border object-cover";
const addImageBtnClass =
  "inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#10B981] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#047857] disabled:cursor-not-allowed disabled:opacity-50";

const HEALTH_STARS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const MAX_GALLERY_IMAGES = 6;
const PRODUCT_IMAGE_MAX_PX = 1800;
const NIP_IMAGE_MAX_PX = 2000;

function actionErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function draftFromProduct(product: FoodVaultProduct): ProductVariantDraft {
  return {
    key: product.id,
    id: product.id,
    name: product.name ?? "",
    sku: product.sku ?? "",
    barcode: product.barcode ?? product.sku ?? "",
    slug: product.slug ?? "",
    slugTouched: Boolean(product.slug),
    description: product.description ?? "",
    ingredients: product.ingredients ?? "",
    allergens: product.allergens ?? "",
    nip: nipFromFacts(product.nutrition_facts),
    nipText: "",
    image_url: product.image_url ?? "",
    gallery_urls: (product.gallery_urls ?? []).slice(0, MAX_GALLERY_IMAGES),
  };
}

export function ProductEditorForm({
  product,
  familyProducts = [],
  vendors = [],
}: {
  product: FoodVaultProduct | null;
  familyProducts?: FoodVaultProduct[];
  vendors?: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(
    getVaultMarketDepartmentNode(product?.category ?? "Pantry")?.department
      ?? product?.category
      ?? "Pantry"
  );
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");
  const [specific, setSpecific] = useState(product?.specific ?? "");
  const [retailPrice, setRetailPrice] = useState(product ? String(product.retail_price) : "");
  const [memberPrice, setMemberPrice] = useState(product ? String(product.member_price) : "");
  const [wholesaleCost, setWholesaleCost] = useState(String(product?.wholesale_cost ?? 0));
  const [vendorId, setVendorId] = useState(product?.vendor_id ?? "");
  const [unitKind, setUnitKind] = useState<UnitKind>(() => inferUnitKind(product));
  const [packAmount, setPackAmount] = useState(() => inferPackAmount(product, inferUnitKind(product)));
  const [originLabel, setOriginLabel] = useState(product?.origin_label ?? "");
  const [binLocation, setBinLocation] = useState(product?.bin_location ?? "");
  const [healthStarRating, setHealthStarRating] = useState(
    product?.health_star_rating != null ? String(product.health_star_rating) : ""
  );
  const [naturalFlavours, setNaturalFlavours] = useState(Boolean(product?.natural_flavours_or_colours));
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isMultibuy, setIsMultibuy] = useState(Boolean(product?.is_multibuy));
  const [multibuyQuantity, setMultibuyQuantity] = useState(
    product?.multibuy_quantity != null ? String(product.multibuy_quantity) : "3"
  );
  const [multibuyPrice, setMultibuyPrice] = useState(
    product?.multibuy_price != null ? String(product.multibuy_price) : ""
  );
  const [variants, setVariants] = useState<ProductVariantDraft[]>(() => {
    if (familyProducts.length > 0) return familyProducts.map(draftFromProduct);
    if (product) return [draftFromProduct(product)];
    return [emptyVariantDraft()];
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploadingSlot, setUploadingSlot] = useState<"primary" | number | null>(null);
  const [readingNip, setReadingNip] = useState(false);
  const nipPhotoRef = useRef<HTMLInputElement>(null);
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const variant = variants[activeIndex] ?? variants[0];
  const packAmountValue = Number(packAmount);
  const unitPriceLabel = formatAutoUnitPriceLabel(
    Number(memberPrice),
    unitKind,
    Number.isFinite(packAmountValue) ? packAmountValue : 0
  );
  const grossProfit = calcGrossProfit(Number(memberPrice), Number(wholesaleCost));
  const multibuyGp = calcMultibuyGrossProfit(
    Number(multibuyPrice),
    Number(wholesaleCost),
    Number(multibuyQuantity)
  );
  const memberPriceValue = Number(memberPrice);
  const multibuyQtyValue = Math.trunc(Number(multibuyQuantity));
  const multibuyPriceValue = Number(multibuyPrice);
  const multibuyPriceInvalid =
    isMultibuy &&
    isMultibuyPriceAtOrAboveMemberTotal(
      memberPriceValue,
      multibuyQtyValue,
      multibuyPriceValue
    );
  const multibuyPriceError = multibuyPriceInvalid
    ? invalidMultibuyPriceMessage(memberPriceValue, multibuyQtyValue)
    : null;
  const uploading = uploadingSlot !== null;
  const extrasFull = variant.gallery_urls.length >= MAX_GALLERY_IMAGES;
  const canAddImage = variant.image_url ? !extrasFull : true;

  const categoryOptions = useMemo(() => {
    const labels = [...VAULT_MARKET_DEPARTMENTS];
    if (category && !labels.includes(category as (typeof VAULT_MARKET_DEPARTMENTS)[number])) {
      return [category, ...labels];
    }
    return labels;
  }, [category]);
  const subcategories = useMemo(() => {
    const labels = [...getVaultMarketSubcategories(category)];
    if (subcategory && !labels.includes(subcategory)) {
      return [subcategory, ...labels];
    }
    return labels;
  }, [category, subcategory]);
  const specifics = useMemo(() => {
    const labels = [...getVaultMarketSpecifics(category, subcategory)];
    if (specific && !labels.includes(specific)) {
      return [specific, ...labels];
    }
    return labels;
  }, [category, subcategory, specific]);

  function updateVariant(index: number, patch: Partial<ProductVariantDraft>) {
    setVariants((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    );
  }

  function handleNameChange(value: string) {
    const nextSlug = variant.slugTouched ? variant.slug : slugifyTitle(value);
    updateVariant(activeIndex, { name: value, slug: nextSlug });
  }

  function addVariant() {
    const next = emptyVariantDraft();
    setVariants((prev) => [...prev, next]);
    setActiveIndex(variants.length);
    setError(null);
  }

  function removeVariant(index: number) {
    if (variants.length < 2) return;
    if (variants[index]?.id) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((current) => {
      if (current === index) return Math.max(0, index - 1);
      if (current > index) return current - 1;
      return current;
    });
    setError(null);
  }

  async function handleNipPhoto(file: File) {
    setReadingNip(true);
    setError(null);
    try {
      const compressed = await convertImageToWebpFile(file, { maxDimension: NIP_IMAGE_MAX_PX });
      const fd = new FormData();
      fd.set("file", compressed);
      const result = await parseVaultMarketNipImageAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.nip) updateVariant(activeIndex, { nip: result.nip });
    } catch (err) {
      setError(actionErrorMessage(err, "Could not read the nutrition information panel."));
    } finally {
      setReadingNip(false);
      if (nipPhotoRef.current) nipPhotoRef.current.value = "";
    }
  }

  async function handleNipText() {
    const pasted = variant.nipText.trim();
    if (!pasted) {
      setError("Paste the nutrition information panel text first.");
      return;
    }
    setReadingNip(true);
    setError(null);
    try {
      const result = await parseVaultMarketNipTextAction(pasted);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.nip) updateVariant(activeIndex, { nip: result.nip });
    } catch (err) {
      setError(actionErrorMessage(err, "Could not read the nutrition information panel text."));
    } finally {
      setReadingNip(false);
    }
  }

  async function handleUpload(file: File, slot: "primary" | "gallery") {
    if (slot === "gallery" && variant.gallery_urls.length >= MAX_GALLERY_IMAGES) return;
    setUploadingSlot(slot === "primary" ? "primary" : variant.gallery_urls.length);
    setError(null);
    try {
      const compressed = await convertImageToWebpFile(file, { maxDimension: PRODUCT_IMAGE_MAX_PX });
      const fd = new FormData();
      fd.set("file", compressed);
      const result = await uploadVaultMarketImageAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!result.url) {
        setError("Upload finished without an image URL.");
        return;
      }
      if (slot === "primary") {
        updateVariant(activeIndex, { image_url: result.url });
        return;
      }
      const url = result.url;
      setVariants((prev) =>
        prev.map((entry, i) => {
          if (i !== activeIndex) return entry;
          if (entry.gallery_urls.length >= MAX_GALLERY_IMAGES) return entry;
          return { ...entry, gallery_urls: [...entry.gallery_urls, url] };
        })
      );
    } catch (err) {
      setError(actionErrorMessage(err, "Could not upload that image."));
    } finally {
      setUploadingSlot(null);
      if (slot === "primary" && primaryFileRef.current) primaryFileRef.current.value = "";
      if (slot === "gallery" && galleryFileRef.current) galleryFileRef.current.value = "";
    }
  }

  function openImagePicker() {
    if (uploading) return;
    if (!variant.image_url) {
      primaryFileRef.current?.click();
      return;
    }
    if (extrasFull) return;
    galleryFileRef.current?.click();
  }

  function updateNipField(field: "serving_size" | "servings_per_pack", value: string) {
    updateVariant(activeIndex, { nip: { ...variant.nip, [field]: value } });
  }

  function updateNipValue(key: NipNutrientKey, field: "per_serve" | "per_100g", value: string) {
    updateVariant(activeIndex, {
      nip: {
        ...variant.nip,
        values: {
          ...variant.nip.values,
          [key]: { ...variant.nip.values[key], [field]: value },
        },
      },
    });
  }

  function familyPayload() {
    const health = healthStarRating ? Number(healthStarRating) : null;
    return {
      product_family_id: product?.product_family_id ?? null,
      brand: brand.trim() || "FoodVault",
      category: category.trim() || "Pantry",
      subcategory: subcategory.trim(),
      specific: specific.trim(),
      retail_price: Number(retailPrice),
      member_price: Number(memberPrice),
      wholesale_cost: Number(wholesaleCost) || 0,
      vendor_id: vendorId.trim(),
      unit_price_label: unitPriceLabel.trim(),
      unit_kind: unitKind,
      pack_amount: Number.isFinite(packAmountValue) ? packAmountValue : 0,
      origin_label: originLabel.trim(),
      bin_location: binLocation.trim(),
      health_star_rating:
        health != null && Number.isFinite(health) && health >= 1 && health <= 5 ? health : null,
      natural_flavours_or_colours: naturalFlavours,
      is_active: isActive,
      is_multibuy: isMultibuy,
      multibuy_quantity: Math.trunc(Number(multibuyQuantity)) || 0,
      multibuy_price: Number(multibuyPrice) || 0,
      variants: variants.map((entry) => ({
        id: entry.id,
        name: entry.name,
        sku: entry.sku,
        barcode: entry.barcode,
        slug: entry.slug,
        description: entry.description,
        ingredients: entry.ingredients,
        allergens: entry.allergens,
        nip: entry.nip,
        image_url: entry.image_url,
        gallery_urls: entry.gallery_urls,
      })),
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (multibuyPriceInvalid) {
      setError(MULTIBUY_SAVE_BLOCKED_MESSAGE);
      return;
    }
    setError(null);
    const payload = familyPayload();
    const validationError = validateProductFamilyInput(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await saveVaultMarketProductFamilyAction(payload);
      if (result.error) {
        const saved = result.createdIds.length + result.updatedIds.length;
        setError(
          saved > 0
            ? `${result.error} ${saved} variant${saved === 1 ? "" : "s"} were saved.`
            : result.error
        );
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  const showMediaThumbs =
    Boolean(variant.image_url) || uploadingSlot === "primary" || variant.gallery_urls.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Product family & categorization
        </h2>
        <p className="mt-1 text-xs text-muted">
          Set once for every flavour or pack variant in this family.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="brand">Brand</label>
            <input
              id="brand"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
                setSpecific("");
              }}
              className={inputClass}
            >
              {categoryOptions.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="subcategory">Subcategory</label>
            <select
              id="subcategory"
              value={subcategory}
              onChange={(e) => {
                setSubcategory(e.target.value);
                setSpecific("");
              }}
              className={inputClass}
            >
              <option value="">Select subcategory</option>
              {subcategories.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="specific">Specific</label>
            <select
              id="specific"
              value={specific}
              onChange={(e) => setSpecific(e.target.value)}
              disabled={!subcategory}
              className={inputClass}
            >
              <option value="">{subcategory ? "Select specific" : "Select a subcategory first"}</option>
              {specifics.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Pricing & units</h2>
        <p className="mt-1 text-xs text-muted">
          Shared across all variants in this family so line pricing stays identical.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="retail_price">Retail price</label>
            <input
              id="retail_price"
              type="number"
              min="0"
              step="0.01"
              required
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="member_price">Member price</label>
            <input
              id="member_price"
              type="number"
              min="0"
              step="0.01"
              required
              value={memberPrice}
              onChange={(e) => {
                setMemberPrice(e.target.value);
                setError((current) =>
                  current === MULTIBUY_SAVE_BLOCKED_MESSAGE ? null : current
                );
              }}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-muted">Includes 15% GST.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="wholesale_cost">Wholesale cost</label>
            <input
              id="wholesale_cost"
              type="number"
              min="0"
              step="0.01"
              value={wholesaleCost}
              onChange={(e) => setWholesaleCost(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-muted">Excluding GST.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="gross_profit">Gross profit</label>
            <div
              id="gross_profit"
              className={`${inputClass} cursor-default bg-surface text-foreground`}
              aria-live="polite"
            >
              {grossProfit.profit == null
                ? "—"
                : `${grossProfit.profit < 0 ? "-" : ""}$${Math.abs(grossProfit.profit).toFixed(2)}${
                    grossProfit.margin == null ? "" : `  ·  ${grossProfit.margin.toFixed(1)}%`
                  }`}
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Member price includes 15% GST. GP uses member price excluding GST
              {grossProfit.exGst != null ? ` (${`$${grossProfit.exGst.toFixed(2)}`})` : ""}.
            </p>
          </div>
          <div className="md:col-span-3 rounded-md border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Multi-Buy Promotion</p>
                <p className="mt-0.5 text-xs text-muted">
                  Offer a bundle price on the storefront, e.g. 3 for $5.00. Total includes 15% GST.
                  Multi-Buy deals are exclusive to FoodVault Members.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isMultibuy}
                aria-label="Multi-Buy Promotion"
                onClick={() => {
                  setIsMultibuy((current) => !current);
                  setError((current) =>
                    current === MULTIBUY_SAVE_BLOCKED_MESSAGE ? null : current
                  );
                }}
                className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  isMultibuy ? "bg-amber-500" : "bg-border"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isMultibuy ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {isMultibuy ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass} htmlFor="multibuy_quantity">Multi-Buy Quantity</label>
                  <input
                    id="multibuy_quantity"
                    type="number"
                    min="2"
                    step="1"
                    required={isMultibuy}
                    value={multibuyQuantity}
                    onChange={(e) => {
                      setMultibuyQuantity(e.target.value);
                      setError((current) =>
                        current === MULTIBUY_SAVE_BLOCKED_MESSAGE ? null : current
                      );
                    }}
                    className={inputClass}
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="multibuy_price">Multi-Buy Total Price</label>
                  <input
                    id="multibuy_price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required={isMultibuy}
                    aria-invalid={multibuyPriceInvalid}
                    aria-describedby={multibuyPriceInvalid ? "multibuy_price_error" : undefined}
                    value={multibuyPrice}
                    onChange={(e) => {
                      setMultibuyPrice(e.target.value);
                      setError((current) =>
                        current === MULTIBUY_SAVE_BLOCKED_MESSAGE ? null : current
                      );
                    }}
                    className={
                      multibuyPriceInvalid
                        ? "w-full rounded-md border-2 border-red-500 bg-red-50/50 px-3 py-2.5 text-sm text-foreground focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        : inputClass
                    }
                    placeholder="5.00"
                  />
                  {multibuyPriceError ? (
                    <p id="multibuy_price_error" role="alert" className="mt-1 text-[11px] font-semibold text-red-600">
                      {multibuyPriceError}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted">Includes 15% GST.</p>
                  )}
                </div>
                <div>
                  <label className={labelClass} htmlFor="multibuy_gp">Multi-Buy Gross Profit %</label>
                  <div
                    id="multibuy_gp"
                    className={`${inputClass} cursor-default bg-white text-foreground`}
                    aria-live="polite"
                  >
                    {multibuyGp.margin == null
                      ? "—"
                      : `${multibuyGp.margin.toFixed(1)}%`}
                  </div>
                  <p className="mt-1 text-[11px] text-muted">
                    GP uses multi-buy price excluding GST
                    {multibuyGp.exGst != null ? ` (${`$${multibuyGp.exGst.toFixed(2)}`})` : ""}
                    {` minus wholesale × ${Number(multibuyQuantity) > 0 ? multibuyQuantity : "qty"}.`}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="vendor_id">Vendor</label>
            <select
              id="vendor_id"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className={inputClass}
            >
              <option value="">Unassigned</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <p className={labelClass}>Unit price type</p>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground">
                <input
                  type="radio"
                  name="unit_kind"
                  checked={unitKind === "solid"}
                  onChange={() => setUnitKind("solid")}
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                />
                Solid foods
              </label>
              <label className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground">
                <input
                  type="radio"
                  name="unit_kind"
                  checked={unitKind === "liquid"}
                  onChange={() => setUnitKind("liquid")}
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                />
                Liquids &amp; beverages
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="pack_amount">
              {unitKind === "solid" ? "Total grams" : "Total litres"}
            </label>
            <input
              id="pack_amount"
              type="number"
              min="0"
              step={unitKind === "solid" ? "1" : "0.01"}
              placeholder={unitKind === "solid" ? "140" : "1.00"}
              value={packAmount}
              onChange={(e) => setPackAmount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="unit_price_label">Unit price label</label>
            <input
              id="unit_price_label"
              readOnly
              tabIndex={-1}
              placeholder={unitKind === "solid" ? "$1.56 / 100g" : "$4.50 / 1L"}
              value={unitPriceLabel}
              className={`${inputClass} cursor-default bg-surface`}
            />
            <p className="mt-1 text-[11px] text-muted">
              Calculated from member price
              {unitKind === "solid" ? " per 100g" : " per 1L"}.
            </p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Attributes & badges</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="origin_label">Origin badge</label>
            <input
              id="origin_label"
              list="origin-options"
              placeholder="Made in New Zealand"
              value={originLabel}
              onChange={(e) => setOriginLabel(e.target.value)}
              className={inputClass}
            />
            <datalist id="origin-options">
              <option value="Made in New Zealand" />
              <option value="Made in Australia" />
              <option value="Packed in New Zealand" />
              <option value="Packed in Australia" />
              <option value="Made in the United Kingdom" />
            </datalist>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="bin_location">Bin location</label>
            <input
              id="bin_location"
              placeholder="Aisle 1 - Shelf A"
              value={binLocation}
              onChange={(e) => setBinLocation(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="health_star_rating">Health Star Rating</label>
            <select
              id="health_star_rating"
              value={healthStarRating}
              onChange={(e) => setHealthStarRating(e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {HEALTH_STARS.map((value) => (
                <option key={value} value={value}>{value.toFixed(1)}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={naturalFlavours}
              onChange={(e) => setNaturalFlavours(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Natural flavours or colours
          </label>
          <label className="flex items-start gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span>
              Active in Vault Market
              <span className="mt-0.5 block text-xs font-normal text-muted">
                Listed on the storefront only after inventory quantity is added.
              </span>
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {variants.map((entry, index) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              index === activeIndex
                ? "bg-[#10B981] text-white"
                : "border border-border bg-white text-foreground hover:bg-surface"
            }`}
          >
            Variant {index + 1}: {variantTabLabel(entry, index)}
          </button>
        ))}
        <button
          type="button"
          onClick={addVariant}
          className="rounded-full border border-dashed border-[#10B981] px-3 py-1.5 text-xs font-semibold text-[#047857] hover:bg-[#10B981]/10"
        >
          + Add Variant
        </button>
      </div>

      <section className={sectionClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Basic information</h2>
            <p className="mt-1 text-xs text-muted">
              Flavour and identifier fields apply only to this variant.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addVariant}
              className="rounded-sm border border-[#10B981] px-3 py-1.5 text-xs font-semibold text-[#047857] hover:bg-[#10B981]/10"
            >
              + Add Variant
            </button>
            {!variant.id && variants.length > 1 ? (
              <button
                type="button"
                onClick={() => removeVariant(activeIndex)}
                className="rounded-sm border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Remove Variant
              </button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="name">Product name</label>
            <input
              id="name"
              required
              value={variant.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="sku">SKU</label>
            <input
              id="sku"
              required
              value={variant.sku}
              onChange={(e) => updateVariant(activeIndex, { sku: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="barcode">Barcode</label>
            <input
              id="barcode"
              value={variant.barcode}
              onChange={(e) => updateVariant(activeIndex, { barcode: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="slug">Slug</label>
            <input
              id="slug"
              value={variant.slug}
              onChange={(e) =>
                updateVariant(activeIndex, { slugTouched: true, slug: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">PDP compliance</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass} htmlFor="description">Product details / copy</label>
            <textarea
              id="description"
              rows={4}
              value={variant.description}
              onChange={(e) => updateVariant(activeIndex, { description: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ingredients">Ingredients</label>
            <textarea
              id="ingredients"
              rows={3}
              value={variant.ingredients}
              onChange={(e) => updateVariant(activeIndex, { ingredients: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="allergens">Allergens</label>
            <textarea
              id="allergens"
              rows={2}
              placeholder="Contains Gluten, Milk. May contain Soy."
              value={variant.allergens}
              onChange={(e) => updateVariant(activeIndex, { allergens: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Nutrition information panel</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            id="nip_photo"
            ref={nipPhotoRef}
            type="file"
            accept="image/*"
            disabled={readingNip}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleNipPhoto(file);
            }}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => nipPhotoRef.current?.click()}
            disabled={readingNip}
            className="fv-btn-primary inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25A2.25 2.25 0 0 1 5.25 6h2.086a1.5 1.5 0 0 0 1.06-.44l.828-.828A1.5 1.5 0 0 1 10.288 4.5h3.424a1.5 1.5 0 0 1 1.06.44l.829.828A1.5 1.5 0 0 0 16.664 6H18.75A2.25 2.25 0 0 1 21 8.25v8.5A2.25 2.25 0 0 1 18.75 19H5.25A2.25 2.25 0 0 1 3 16.75v-8.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            </svg>
            Add image of NIP
          </button>
          {readingNip ? (
            <p className="text-sm text-muted">Reading panel...</p>
          ) : (
            <p className="text-xs text-muted">
              Photo is used only to fill the panel below. It is not saved as a product image.
            </p>
          )}
        </div>
        <div className="mt-5">
          <label className={labelClass} htmlFor="nip_text">Paste NIP text</label>
          <textarea
            id="nip_text"
            rows={4}
            value={variant.nipText}
            onChange={(e) => updateVariant(activeIndex, { nipText: e.target.value })}
            placeholder="Paste the full nutrition information panel as text, then fill the fields below."
            disabled={readingNip}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => void handleNipText()}
            disabled={readingNip || !variant.nipText.trim()}
            className="fv-btn-primary mt-3 inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            Fill from text
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="serving_size">Serving size</label>
            <input
              id="serving_size"
              placeholder="25g"
              value={variant.nip.serving_size}
              onChange={(e) => updateNipField("serving_size", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="servings_per_pack">Servings per pack</label>
            <input
              id="servings_per_pack"
              placeholder="6"
              value={variant.nip.servings_per_pack}
              onChange={(e) => updateNipField("servings_per_pack", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-semibold">Nutrient</th>
                <th className="py-2 pr-3 font-semibold">Per serving</th>
                <th className="py-2 font-semibold">Per 100g</th>
              </tr>
            </thead>
            <tbody>
              {NIP_NUTRIENTS.map((nutrient) => (
                <tr key={nutrient.key} className="border-b border-border/70">
                  <td className="py-2 pr-3 font-medium text-foreground">{nutrient.label}</td>
                  <td className="py-2 pr-3">
                    <input
                      value={variant.nip.values[nutrient.key].per_serve}
                      onChange={(e) => updateNipValue(nutrient.key, "per_serve", e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      value={variant.nip.values[nutrient.key].per_100g}
                      onChange={(e) => updateNipValue(nutrient.key, "per_100g", e.target.value)}
                      className={inputClass}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Media</h2>
        <input
          id="image_file"
          ref={primaryFileRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file, "primary");
          }}
          className="sr-only"
        />
        <input
          id="gallery_file"
          ref={galleryFileRef}
          type="file"
          accept="image/*"
          disabled={uploading || extrasFull}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file, "gallery");
          }}
          className="sr-only"
        />

        <div className="mt-4">
          {showMediaThumbs ? (
            <div className="flex flex-wrap items-end gap-3">
              {variant.image_url ? (
                <div className="space-y-1">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={variant.image_url} alt="Primary product" className={thumbClass} />
                    {uploadingSlot === "primary" ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 text-[10px] font-semibold text-white">
                        Uploading...
                      </div>
                    ) : (
                      <span className="absolute left-1 top-1 rounded bg-black/65 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                        Primary
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateVariant(activeIndex, { image_url: "" });
                      if (primaryFileRef.current) primaryFileRef.current.value = "";
                    }}
                    disabled={uploading}
                    className="text-xs font-semibold text-red-600 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadingSlot === "primary" ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-md border border-border bg-surface text-[10px] font-semibold text-muted">
                  Uploading...
                </div>
              ) : null}

              {variant.gallery_urls.map((url, index) => (
                <div key={`${url}-${index}`} className="space-y-1">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Gallery image ${index + 1}`} className={thumbClass} />
                    {uploadingSlot === index ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 text-[10px] font-semibold text-white">
                        Uploading...
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateVariant(activeIndex, {
                        gallery_urls: variant.gallery_urls.filter((_, i) => i !== index),
                      })
                    }
                    disabled={uploading}
                    className="text-xs font-semibold text-red-600 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {typeof uploadingSlot === "number" && uploadingSlot === variant.gallery_urls.length ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-md border border-border bg-surface text-[10px] font-semibold text-muted">
                  Uploading...
                </div>
              ) : null}

              <button
                type="button"
                onClick={openImagePicker}
                disabled={uploading || !canAddImage}
                className={addImageBtnClass}
              >
                Add image
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border bg-surface/60 px-4 py-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-md border border-border bg-white text-muted">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 6.75h.007v.008H3.75V6.75Zm16.5 0A2.25 2.25 0 0 0 18 4.5H6A2.25 2.25 0 0 0 3.75 6.75v10.5A2.25 2.25 0 0 0 6 19.5h12a2.25 2.25 0 0 0 2.25-2.25V6.75Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Product images</p>
                <p className="mt-0.5 text-xs text-muted">Add a primary photo first, then up to {MAX_GALLERY_IMAGES} extras.</p>
                <button
                  type="button"
                  onClick={openImagePicker}
                  disabled={uploading}
                  className={`${addImageBtnClass} mt-2`}
                >
                  Add image
                </button>
              </div>
            </div>
          )}
          <p className="mt-2 text-xs text-muted">
            {variant.image_url
              ? extrasFull
                ? `Maximum of ${MAX_GALLERY_IMAGES} extra images.`
                : `Up to ${MAX_GALLERY_IMAGES} extra images. ${MAX_GALLERY_IMAGES - variant.gallery_urls.length} remaining.`
              : "Images are compressed to WEBP before upload."}
          </p>
        </div>

        <div className="mt-4 max-w-xl">
          <label className={labelClass} htmlFor="image_url_paste">Or paste a primary image URL</label>
          <input
            id="image_url_paste"
            type="text"
            placeholder="https://"
            value={variant.image_url}
            onChange={(e) => updateVariant(activeIndex, { image_url: e.target.value })}
            className={inputClass}
          />
        </div>
      </section>

      {error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-sm border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
        >
          Cancel
        </button>
        <div
          onClick={() => {
            if (multibuyPriceInvalid) setError(MULTIBUY_SAVE_BLOCKED_MESSAGE);
          }}
        >
          <button
            type="submit"
            disabled={pending || uploading || readingNip || multibuyPriceInvalid}
            className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
          {pending
            ? "Saving..."
            : product
              ? variants.some((entry) => !entry.id)
                ? `Save and add ${variants.filter((entry) => !entry.id).length} variant${
                    variants.filter((entry) => !entry.id).length === 1 ? "" : "s"
                  }`
                : "Save product"
              : variants.length > 1
                ? `Create ${variants.length} products`
                : "Create product"}
          </button>
        </div>
      </div>
    </form>
  );
}
