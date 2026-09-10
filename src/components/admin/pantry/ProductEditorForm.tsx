"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PARTNER_CATEGORY_TAXONOMY,
  PRIMARY_DEPARTMENTS,
  type PrimaryDepartment,
} from "@/data/partner-categories";
import { convertImageToWebpFile } from "@/lib/admin/compress-image-webp";
import {
  parseVaultMarketNipImageAction,
  parseVaultMarketNipTextAction,
  saveVaultMarketProductAction,
  uploadVaultMarketImageAction,
} from "@/lib/admin/pantry-actions";
import {
  NIP_NUTRIENTS,
  nipFromFacts,
  unitPriceLabelFromProduct,
  type NipNutrientKey,
} from "@/lib/admin/pantry-shared";
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

export function ProductEditorForm({
  product,
  vendors = [],
}: {
  product: FoodVaultProduct | null;
  vendors?: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [category, setCategory] = useState(product?.category ?? "Pantry");
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() =>
    (product?.gallery_urls ?? []).slice(0, MAX_GALLERY_IMAGES)
  );
  const [uploadingSlot, setUploadingSlot] = useState<"primary" | number | null>(null);
  const [readingNip, setReadingNip] = useState(false);
  const [nipText, setNipText] = useState("");
  const [nip, setNip] = useState(() => nipFromFacts(product?.nutrition_facts));
  const nipPhotoRef = useRef<HTMLInputElement>(null);
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const uploading = uploadingSlot !== null;
  const extrasFull = galleryUrls.length >= MAX_GALLERY_IMAGES;
  const canAddImage = imageUrl ? !extrasFull : true;

  const subcategories = useMemo(() => {
    const department = (
      PRIMARY_DEPARTMENTS.includes(category as PrimaryDepartment)
        ? category
        : "Pantry"
    ) as PrimaryDepartment;
    return PARTNER_CATEGORY_TAXONOMY[department] ?? [];
  }, [category]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugifyTitle(value));
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
      if (result.nip) setNip(result.nip);
    } catch (err) {
      setError(actionErrorMessage(err, "Could not read the nutrition information panel."));
    } finally {
      setReadingNip(false);
      if (nipPhotoRef.current) nipPhotoRef.current.value = "";
    }
  }

  async function handleNipText() {
    const pasted = nipText.trim();
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
      if (result.nip) setNip(result.nip);
    } catch (err) {
      setError(actionErrorMessage(err, "Could not read the nutrition information panel text."));
    } finally {
      setReadingNip(false);
    }
  }

  async function handleUpload(file: File, slot: "primary" | "gallery") {
    if (slot === "gallery" && galleryUrls.length >= MAX_GALLERY_IMAGES) return;
    setUploadingSlot(slot === "primary" ? "primary" : galleryUrls.length);
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
        setImageUrl(result.url);
        return;
      }
      const url = result.url;
      setGalleryUrls((prev) => (prev.length >= MAX_GALLERY_IMAGES ? prev : [...prev, url]));
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
    if (!imageUrl) {
      primaryFileRef.current?.click();
      return;
    }
    if (extrasFull) return;
    galleryFileRef.current?.click();
  }

  function updateNipField(field: "serving_size" | "servings_per_pack", value: string) {
    setNip((prev) => ({ ...prev, [field]: value }));
  }

  function updateNipValue(key: NipNutrientKey, field: "per_serve" | "per_100g", value: string) {
    setNip((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [key]: { ...prev.values[key], [field]: value },
      },
    }));
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveVaultMarketProductAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  const showMediaThumbs = Boolean(imageUrl) || uploadingSlot === "primary" || galleryUrls.length > 0;

  return (
    <form action={handleSubmit} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Basic information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="name">Product name</label>
            <input id="name" name="name" required value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="sku">SKU</label>
            <input id="sku" name="sku" required defaultValue={product?.sku ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="barcode">Barcode</label>
            <input id="barcode" name="barcode" defaultValue={product?.barcode ?? product?.sku ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="brand">Brand</label>
            <input id="brand" name="brand" required defaultValue={product?.brand ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
              }}
              className={inputClass}
            >
              {PRIMARY_DEPARTMENTS.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="subcategory">Subcategory</label>
            <select
              id="subcategory"
              name="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className={inputClass}
            >
              <option value="">Select subcategory</option>
              {subcategories.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Pricing & units</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="retail_price">Retail price</label>
            <input id="retail_price" name="retail_price" type="number" min="0" step="0.01" required defaultValue={product?.retail_price ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="member_price">Member price</label>
            <input id="member_price" name="member_price" type="number" min="0" step="0.01" required defaultValue={product?.member_price ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="wholesale_cost">Wholesale cost</label>
            <input id="wholesale_cost" name="wholesale_cost" type="number" min="0" step="0.01" defaultValue={product?.wholesale_cost ?? 0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="vendor_id">Vendor</label>
            <select id="vendor_id" name="vendor_id" defaultValue={product?.vendor_id ?? ""} className={inputClass}>
              <option value="">Unassigned</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="unit_price_label">Unit price label</label>
            <input
              id="unit_price_label"
              name="unit_price_label"
              placeholder="$1.56 / 100g"
              defaultValue={product ? unitPriceLabelFromProduct(product) : ""}
              className={inputClass}
            />
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
              name="origin_label"
              list="origin-options"
              placeholder="Made in New Zealand"
              defaultValue={product?.origin_label ?? ""}
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
              name="bin_location"
              placeholder="Aisle 1 - Shelf A"
              defaultValue={product?.bin_location ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="health_star_rating">Health Star Rating</label>
            <select
              id="health_star_rating"
              name="health_star_rating"
              defaultValue={product?.health_star_rating ?? ""}
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
              name="natural_flavours_or_colours"
              defaultChecked={Boolean(product?.natural_flavours_or_colours)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Natural flavours or colours
          </label>
          <label className="flex items-start gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={product?.is_active ?? true}
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

      <section className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">PDP compliance</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass} htmlFor="description">Product details / copy</label>
            <textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ingredients">Ingredients</label>
            <textarea id="ingredients" name="ingredients" rows={3} defaultValue={product?.ingredients ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="allergens">Allergens</label>
            <textarea
              id="allergens"
              name="allergens"
              rows={2}
              placeholder="Contains Gluten, Milk. May contain Soy."
              defaultValue={product?.allergens ?? ""}
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
            value={nipText}
            onChange={(e) => setNipText(e.target.value)}
            placeholder="Paste the full nutrition information panel as text, then fill the fields below."
            disabled={readingNip}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => void handleNipText()}
            disabled={readingNip || !nipText.trim()}
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
              name="serving_size"
              placeholder="25g"
              value={nip.serving_size}
              onChange={(e) => updateNipField("serving_size", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="servings_per_pack">Servings per pack</label>
            <input
              id="servings_per_pack"
              name="servings_per_pack"
              placeholder="6"
              value={nip.servings_per_pack}
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
                      name={`${nutrient.key}_per_serve`}
                      value={nip.values[nutrient.key].per_serve}
                      onChange={(e) => updateNipValue(nutrient.key, "per_serve", e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      name={`${nutrient.key}_per_100g`}
                      value={nip.values[nutrient.key].per_100g}
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
        <input type="hidden" name="image_url" value={imageUrl} />
        <input type="hidden" name="gallery_urls" value={galleryUrls.join("\n")} />
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
              {imageUrl ? (
                <div className="space-y-1">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Primary product" className={thumbClass} />
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
                      setImageUrl("");
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

              {galleryUrls.map((url, index) => (
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
                    onClick={() => setGalleryUrls((prev) => prev.filter((_, i) => i !== index))}
                    disabled={uploading}
                    className="text-xs font-semibold text-red-600 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {typeof uploadingSlot === "number" && uploadingSlot === galleryUrls.length ? (
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
            {imageUrl
              ? extrasFull
                ? `Maximum of ${MAX_GALLERY_IMAGES} extra images.`
                : `Up to ${MAX_GALLERY_IMAGES} extra images. ${MAX_GALLERY_IMAGES - galleryUrls.length} remaining.`
              : "Images are compressed to WEBP before upload."}
          </p>
        </div>

        <div className="mt-4 max-w-xl">
          <label className={labelClass} htmlFor="image_url_paste">Or paste a primary image URL</label>
          <input
            id="image_url_paste"
            type="text"
            placeholder="https://"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputClass}
          />
        </div>
      </section>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-sm border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending || uploading || readingNip}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving..." : product ? "Save product" : "Create product"}
        </button>
      </div>
    </form>
  );
}
