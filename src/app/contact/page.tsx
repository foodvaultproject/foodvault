import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactAlert, ContactHero } from "@/components/contact/ContactSidebar";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact FoodVault for membership, partner, or general enquiries in New Zealand. Our team is ready to assist members and brands.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <section className="bg-background py-6 sm:py-7 md:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactAlert />
          <div className="mt-10 lg:mt-12">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
