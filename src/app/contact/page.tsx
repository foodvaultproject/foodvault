import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import {
  ContactAlert,
  ContactHero,
  ContactSidebar,
} from "@/components/contact/ContactSidebar";
import { getActiveMemberView } from "@/lib/member/active-member";
import { getPartnerHomeView } from "@/lib/partner-home-view";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact FoodVault for membership, partner, or general enquiries in New Zealand. Our team is ready to assist members and brands.",
};

export default async function ContactPage() {
  const [{ isActiveMember }, { isPartner }] = await Promise.all([
    getActiveMemberView(),
    getPartnerHomeView(),
  ]);
  const hidePromoPanel = isActiveMember || isPartner;

  return (
    <>
      <ContactHero />
      <section className="bg-background py-6 sm:py-7 md:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactAlert />

          {hidePromoPanel ? (
            <div className="mt-10 lg:mt-12">
              <ContactForm />
            </div>
          ) : (
            <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-3 lg:gap-12">
              <div className="lg:col-span-2">
                <ContactForm />
              </div>
              <ContactSidebar />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
