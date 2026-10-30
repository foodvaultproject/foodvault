import type { Metadata } from "next";
import { headers } from "next/headers";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactAlert, ContactHero } from "@/components/contact/ContactSidebar";
import { getAppMode } from "@/lib/app-mode";

async function requestIsStockUp() {
  const headerStore = await headers();
  return getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup";
}

export async function generateMetadata(): Promise<Metadata> {
  const stockup = await requestIsStockUp();
  return {
    title: "Contact Us",
    description: stockup
      ? "Contact StockUp about supermarket orders, delivery, or becoming a supplier in New Zealand."
      : "Contact FoodVault for membership, partner, or general enquiries in New Zealand. Our team is ready to assist members, brands, and hospitality venues.",
  };
}

export default async function ContactPage() {
  const stockup = await requestIsStockUp();
  return (
    <div className={stockup ? "stockup-contact bg-background" : undefined}>
      <ContactHero stockup={stockup} />
      <section className="bg-background py-6 sm:py-7 md:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {stockup ? null : <ContactAlert />}
          <div className={stockup ? undefined : "mt-10 lg:mt-12"}>
            <ContactForm stockup={stockup} />
          </div>
        </div>
      </section>
    </div>
  );
}
