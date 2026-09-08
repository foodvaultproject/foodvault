import type { Metadata } from "next";
import { OrderSuccessView } from "@/components/pantry/OrderSuccessView";
import { getPantryOrderByStripeSessionId } from "@/lib/commerce/orders";
import { PAGE_PY } from "@/lib/section-spacing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your Vault Market order has been placed at member pricing.",
};

type OrderSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId
    ? await getPantryOrderByStripeSessionId(sessionId)
    : null;

  return (
    <section className="bg-page">
      <div className={`mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 ${PAGE_PY}`}>
        <OrderSuccessView sessionId={sessionId ?? ""} initialOrder={order} />
      </div>
    </section>
  );
}
