export type OfferScope = "entire_store" | "selected_products";

export const MAX_SELECTED_PRODUCTS = 20;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 50;

export type SelectedProduct = {
  id: string;
  imageUrl: string;
  name: string;
  shortDescription: string;
  productUrl: string;
  discountPercent: number;
  conditions?: string | null;
  sortOrder: number;
};

/** Editable product row in application / listing forms. */
export type SelectedProductDraft = {
  id: string;
  imageUrl: string | null;
  imageFile: File | null;
  name: string;
  shortDescription: string;
  productUrl: string;
  discountValue: string;
  conditions: string;
  sortOrder: number;
};

export function sanitizeDiscountValue(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 2);
}

export function createSelectedProductDraft(sortOrder: number): SelectedProductDraft {
  return {
    id: crypto.randomUUID(),
    imageUrl: null,
    imageFile: null,
    name: "",
    shortDescription: "",
    productUrl: "",
    discountValue: "",
    conditions: "",
    sortOrder,
  };
}

export function parseOfferScope(value: unknown): OfferScope {
  if (value === "selected_products") return "selected_products";
  return "entire_store";
}

export function offerScopeFromLegacyAppliesTo(value: string | null | undefined): OfferScope {
  if (value?.trim() === "Selected Products") return "selected_products";
  return "entire_store";
}

export function offerAppliesToLabel(scope: OfferScope): string {
  return scope === "selected_products" ? "Selected Products" : "Entire Store";
}

function parseProductRow(value: unknown, index: number): SelectedProduct | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const imageUrl = String(row.imageUrl ?? row.image_url ?? "").trim();
  const name = String(row.name ?? "").trim();
  const productUrl = String(row.productUrl ?? row.product_url ?? "").trim();
  const discountPercent = Number(row.discountPercent ?? row.discount_percent);
  const shortDescription = String(
    row.shortDescription ?? row.short_description ?? ""
  ).trim();

  if (!imageUrl || !name || !productUrl || !Number.isFinite(discountPercent)) {
    return null;
  }

  return {
    id: String(row.id ?? `product-${index}`),
    imageUrl,
    name,
    shortDescription: shortDescription.slice(0, MAX_PRODUCT_DESCRIPTION_LENGTH),
    productUrl,
    discountPercent,
    conditions:
      typeof row.conditions === "string" && row.conditions.trim()
        ? row.conditions.trim()
        : null,
    sortOrder: Number.isFinite(Number(row.sortOrder ?? row.sort_order))
      ? Number(row.sortOrder ?? row.sort_order)
      : index,
  };
}

export function parseSelectedProducts(value: unknown): SelectedProduct[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row, index) => parseProductRow(row, index))
    .filter((item): item is SelectedProduct => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function selectedProductToDraft(product: SelectedProduct): SelectedProductDraft {
  return {
    id: product.id,
    imageUrl: product.imageUrl,
    imageFile: null,
    name: product.name,
    shortDescription: product.shortDescription,
    productUrl: product.productUrl,
    discountValue: String(product.discountPercent),
    conditions: product.conditions ?? "",
    sortOrder: product.sortOrder,
  };
}

export function draftToStoredProduct(draft: SelectedProductDraft): SelectedProduct | null {
  const imageUrl = draft.imageUrl?.trim();
  const name = draft.name.trim();
  const productUrl = draft.productUrl.trim();
  const discountPercent = Number(sanitizeDiscountValue(draft.discountValue));

  if (!imageUrl || !name || !productUrl || !discountPercent) {
    return null;
  }

  return {
    id: draft.id,
    imageUrl,
    name,
    shortDescription: draft.shortDescription.trim().slice(0, MAX_PRODUCT_DESCRIPTION_LENGTH),
    productUrl,
    discountPercent,
    conditions: draft.conditions.trim() || null,
    sortOrder: draft.sortOrder,
  };
}

export function memberCodeDiscountFromOffer(
  scope: OfferScope,
  discountValue: string,
  products: SelectedProductDraft[] | SelectedProduct[]
): string {
  if (scope === "entire_store") {
    return sanitizeDiscountValue(discountValue) || "10";
  }

  const discounts = products
    .map((product) =>
      Number(
        sanitizeDiscountValue(
          "discountValue" in product
            ? product.discountValue
            : String(product.discountPercent)
        )
      )
    )
    .filter((value) => value > 0);

  if (discounts.length === 0) return "10";
  return String(Math.max(...discounts));
}

export type OfferValidationResult = { ok: true } | { ok: false; message: string };

export function validateOfferForm(
  scope: OfferScope,
  discountValue: string,
  products: SelectedProductDraft[],
  options: { requireProducts?: boolean } = {}
): OfferValidationResult {
  if (scope === "entire_store") {
    const value = Number(sanitizeDiscountValue(discountValue));
    if (!value || value < 1 || value > 99) {
      return { ok: false, message: "Enter a discount between 1 and 99." };
    }
    return { ok: true };
  }

  if (products.length === 0) {
    return {
      ok: false,
      message: options.requireProducts
        ? "Add at least one selected product."
        : "Add at least one product for a Selected Products offer.",
    };
  }

  if (products.length > MAX_SELECTED_PRODUCTS) {
    return {
      ok: false,
      message: `You can add up to ${MAX_SELECTED_PRODUCTS} products.`,
    };
  }

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const label = `Product ${index + 1}`;

    if (!product.imageUrl && !product.imageFile) {
      return { ok: false, message: `${label}: product image is required.` };
    }
    if (!product.name.trim()) {
      return { ok: false, message: `${label}: product name is required.` };
    }
    if (!product.shortDescription.trim()) {
      return { ok: false, message: `${label}: short description is required.` };
    }
    if (product.shortDescription.trim().length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
      return {
        ok: false,
        message: `${label}: description must be ${MAX_PRODUCT_DESCRIPTION_LENGTH} characters or fewer.`,
      };
    }
    if (!product.productUrl.trim()) {
      return { ok: false, message: `${label}: product URL is required.` };
    }
    const discount = Number(sanitizeDiscountValue(product.discountValue));
    if (!discount || discount < 1 || discount > 99) {
      return {
        ok: false,
        message: `${label}: enter a discount between 1 and 99.`,
      };
    }
  }

  return { ok: true };
}

export function buildStorewideDiscountTitle(discountValue: string): string {
  const value = sanitizeDiscountValue(discountValue);
  return value ? `${value}% Off Storewide` : "";
}
