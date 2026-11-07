import type { Metadata } from "next";
import { VaultMarketCheckout } from "@/components/pantry/VaultMarketCheckout";
import { getCheckoutAccountDefaults } from "@/lib/commerce/saved-delivery-actions";
import { PAGE_PY } from "@/lib/section-spacing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your StockUp supermarket order with NZ delivery details and Stripe.",
};

export default async function VaultMarketCheckoutPage() {
  const account = await getCheckoutAccountDefaults();

  return (
    <section className="min-w-0 overflow-x-clip bg-page">
      <div className={`mx-auto min-w-0 max-w-[1200px] px-4 sm:px-6 lg:px-8 ${PAGE_PY}`}>
        <VaultMarketCheckout account={account} />
      </div>
    </section>
  );
}
