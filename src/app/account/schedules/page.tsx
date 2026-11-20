import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AutoRestockManager } from "@/components/account/AutoRestockManager";
import { getAppMode } from "@/lib/app-mode";
import { offerPrice } from "@/lib/commerce/catalog";
import { getScheduleProductSnapshots } from "@/lib/commerce/products";
import { parseSavedDelivery, STOCKUP_DELIVERY_METADATA_KEY } from "@/lib/commerce/saved-delivery";
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

  const member = await requireAuthenticatedMember();
  const params = await searchParams;
  const quantity = Math.min(99, Math.max(1, Math.trunc(Number(params.qty) || 1)));
  const [page, seeded] = await Promise.all([
    loadAutoRestockPage(member),
    params.productId ? getScheduleProductSnapshots([params.productId]) : Promise.resolve([]),
  ]);
  if (!page) notFound();
  const accountSaved = parseSavedDelivery(member.metadata[STOCKUP_DELIVERY_METADATA_KEY]);
  const seed = seeded[0];

  return (
    <AutoRestockManager
      email={page.email}
      card={page.card}
      schedules={page.schedules}
      savedAddress={accountSaved}
      startNew={params.new === "1"}
      fromCart={params.from === "cart"}
      seedProduct={
        seed?.is_active
          ? {
              productId: seed.id,
              name: seed.name,
              brand: seed.brand,
              price: offerPrice(seed),
              quantity,
              imageUrl: seed.image_url,
            }
          : null
      }
    />
  );
}
