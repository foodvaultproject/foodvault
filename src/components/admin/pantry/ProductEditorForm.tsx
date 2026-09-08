"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PARTNER_CATEGORY_TAXONOMY,
  PRIMARY_DEPARTMENTS,
  type PrimaryDepartment,
} from "@/data/partner-categories";
import { saveVaultMarketProductAction, uploadVaultMarketImageAction } from "@/lib/admin/pantry-actions";
import { NIP_NUTRIENTS, nipFromFacts, unitPriceLabelFromProduct } from "@/lib/admin/pantry-shared";
import { slugifyTitle } from "@/lib/admin/types";
import type { FoodVaultProduct } from "@/types/commerce";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";
const sectionClass = "rounded border border-border bg-white p-5 sm:p-6";

const HEALTH_STARS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

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
  const [uploading, setUploading] = useState(false);
  const nip = useMemo(() => nipFromFacts(product?.nutrition_facts), [product]);

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

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadVaultMarketImageAction(fd);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) setImageUrl(result.url);
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
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={product?.is_active ?? true}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Active in Vault Market
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
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="serving_size">Serving size</label>
            <input id="serving_size" name="serving_size" placeholder="25g" defaultValue={nip.serving_size} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="servings_per_pack">Servings per pack</label>
            <input id="servings_per_pack" name="servings_per_pack" placeholder="6" defaultValue={nip.servings_per_pack} className={inputClass} />
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
                      defaultValue={nip.values[nutrient.key].per_serve}
                      className={inputClass}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      name={`${nutrient.key}_per_100g`}
                      defaultValue={nip.values[nutrient.key].per_100g}
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
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="image_url">Image URL</label>
            <input
              id="image_url"
              name="image_url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="image_file">Or upload an image</label>
            <input
              id="image_file"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
              className="block w-full text-sm text-muted"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="gallery_urls">Extra gallery URLs</label>
            <textarea
              id="gallery_urls"
              name="gallery_urls"
              rows={3}
              placeholder="One URL per line"
              defaultValue={product?.gallery_urls?.join("\n") ?? ""}
              className={inputClass}
            />
          </div>
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
          disabled={pending || uploading}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving..." : product ? "Save product" : "Create product"}
        </button>
      </div>
    </form>
  );
}
