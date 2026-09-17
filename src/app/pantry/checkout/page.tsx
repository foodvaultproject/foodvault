import type { Metadata } from "next";
import { VaultMarketCheckout } from "@/components/pantry/VaultMarketCheckout";
import { PAGE_PY } from "@/lib/section-spacing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Vault Market order with NZ delivery details and Stripe.",
};

export default function VaultMarketCheckoutPage() {
  return (
    <section className="min-w-0 overflow-x-clip bg-page">
      <div className={`mx-auto min-w-0 max-w-[1200px] px-4 sm:px-6 lg:px-8 ${PAGE_PY}`}>
        <VaultMarketCheckout />
      </div>
    </section>
  );
}
