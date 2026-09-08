import { getVaultMarketProductsByIds } from "@/lib/commerce/products";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import {
  getStripeClient,
  toStripeAmount,
} from "@/lib/payment-service/providers/stripe-client";
import type { FoodVaultProduct } from "@/types/commerce";

export type PantryCheckoutRequestItem = {
  productId: string;
  quantity: number;
};

export type ValidatedPantryCheckoutItem = {
  product: FoodVaultProduct;
  quantity: number;
};

const MAX_CART_ITEMS = 20;
const MAX_LINE_QUANTITY = 99;

export function parsePantryCheckoutItems(
  raw: unknown
): PantryCheckoutRequestItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("Cart items are required");
  }

  const merged = new Map<string, number>();

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") {
      throw new Error("Each cart item must include productId and quantity");
    }

    const productId =
      "productId" in entry && typeof entry.productId === "string"
        ? entry.productId.trim()
        : "";
    const quantity =
      "quantity" in entry ? Math.trunc(Number(entry.quantity)) : NaN;

    if (!productId) {
      throw new Error("Each cart item must include a productId");
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error("Each cart item must have a quantity of at least 1");
    }
    if (quantity > MAX_LINE_QUANTITY) {
      throw new Error(`Quantity cannot exceed ${MAX_LINE_QUANTITY} per item`);
    }

    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  const items = [...merged.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  if (items.length === 0) {
    throw new Error("Your cart is empty");
  }
  if (items.length > MAX_CART_ITEMS) {
    throw new Error(`Cart cannot contain more than ${MAX_CART_ITEMS} products`);
  }

  return items;
}

export async function validatePantryCheckoutItems(
  items: PantryCheckoutRequestItem[]
): Promise<ValidatedPantryCheckoutItem[]> {
  const products = await getVaultMarketProductsByIds(
    items.map((item) => item.productId)
  );

  return items.map((item) => {
    const aliases = [item.productId];
    if (item.productId.startsWith("seed-")) {
      aliases.push(item.productId.slice(5).toUpperCase());
    }
    const product = products.find(
      (entry) => aliases.includes(entry.id) || aliases.includes(entry.sku)
    );
    if (!product) {
      throw new Error("One or more products are no longer available");
    }
    if (product.member_price <= 0) {
      throw new Error(`${product.name} does not have a valid member price`);
    }
    if (product.stock_quantity <= 0) {
      throw new Error(`${product.name} is out of stock`);
    }
    if (item.quantity > product.stock_quantity) {
      throw new Error(
        `Only ${product.stock_quantity} of ${product.name} left in stock`
      );
    }

    return { product, quantity: item.quantity };
  });
}

export function pantryCheckoutSavings(
  items: ValidatedPantryCheckoutItem[]
): number {
  return items.reduce((sum, item) => {
    const perUnit = Math.max(0, item.product.retail_price - item.product.member_price);
    return sum + perUnit * item.quantity;
  }, 0);
}

export function getCheckoutOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host?.includes("localhost") || host?.startsWith("127.") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  return (
    getPaymentServiceConfig().appUrl.replace(/\/$/, "") ||
    "http://localhost:3001"
  );
}

export async function createPantryCheckoutSession(input: {
  items: ValidatedPantryCheckoutItem[];
  userId?: string | null;
  customerEmail?: string | null;
  stripeCustomerId?: string | null;
  origin: string;
}) {
  const stripe = getStripeClient();
  const totalSavings = pantryCheckoutSavings(input.items);
  const origin = input.origin.replace(/\/$/, "");
  const stripeCustomerId = input.stripeCustomerId?.trim() || null;

  return stripe.checkout.sessions.create({
    mode: "payment",
    currency: "nzd",
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["NZ", "AU"],
    },
    line_items: input.items.map(({ product, quantity }) => ({
      quantity,
      price_data: {
        currency: "nzd",
        unit_amount: toStripeAmount(product.member_price, "nzd"),
        product_data: {
          name: product.name,
          description: product.brand ? `${product.brand} · Member price` : "Member price",
          ...(product.image_url?.startsWith("https://")
            ? { images: [product.image_url] }
            : {}),
          metadata: {
            product_id: product.id,
            sku: product.sku,
          },
        },
      },
    })),
    success_url: `${origin}/pantry/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pantry`,
    ...(input.userId ? { client_reference_id: input.userId } : {}),
    ...(stripeCustomerId
      ? {
          customer: stripeCustomerId,
          customer_update: { shipping: "auto" as const, address: "auto" as const },
          saved_payment_method_options: {
            payment_method_save: "enabled",
            allow_redisplay_filters: ["always", "limited", "unspecified"],
          },
        }
      : input.customerEmail
        ? { customer_email: input.customerEmail }
        : {}),
    metadata: {
      foodvault: "vault_market",
      user_id: input.userId ?? "",
      cart_items: input.items
        .map(({ product, quantity }) => `${product.id}:${quantity}`)
        .join(",")
        .slice(0, 500),
      total_savings: totalSavings.toFixed(2),
    },
  } as Parameters<typeof stripe.checkout.sessions.create>[0]);
}
