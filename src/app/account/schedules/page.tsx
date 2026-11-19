import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AutoRestockManager } from "@/components/account/AutoRestockManager";
import { getAppMode } from "@/lib/app-mode";
import { offerPrice } from "@/lib/commerce/catalog";
import { getVaultMarketProductsByIds } from "@/lib/commerce/products";
import { getCheckoutAccountDefaults } from "@/lib/commerce/saved-delivery-actions";
import { loadAutoRestockPage } from "@/lib/commerce/schedule-actions";
import { requireAuthenticatedMember } from "@/lib/member/auth";

export const metadata: Metadata = {
  title: "Auto-Restock",
  description: "Manage StockUp recurring grocery schedules, delivery dates, and your saved card.",
};

export default async function AutoRestockPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; from?: string; productId?: string; qty?: string }>;
}) {
  const headerStore = await headers();
  if (getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) !== "stockup") {
    notFound();
  }

  await requireAuthenticatedMember();
  const [page, account, params] = await Promise.all([
    loadAutoRestockPage(),
    getCheckoutAccountDefaults(),
    searchParams,
  ]);
  if (!page) notFound();

  const quantity = Math.min(99, Math.max(1, Math.trunc(Number(params.qty) || 1)));
  const seeded = params.productId ? (await getVaultMarketProductsByIds([params.productId]))[0] : null;

  return (
    <AutoRestockManager
      email={page.email}
      card={page.card}
      schedules={page.schedules}
      savedAddress={account.saved}
      startNew={params.new === "1"}
      fromCart={params.from === "cart"}
      seedProduct={
        seeded?.is_active
          ? {
              productId: seeded.id,
              name: seeded.name,
              brand: seeded.brand,
              price: offerPrice(seeded),
              quantity,
              imageUrl: seeded.image_url,
            }
          : null
      }
    />
  );
}
