import Link from "next/link";
import {
  LegalDocShell,
  LegalSection,
} from "@/components/legal/LegalDocShell";

const navItems = [
  { id: "about", label: "About FoodVault" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "Accounts" },
  { id: "membership", label: "Membership" },
  { id: "membership-fees", label: "Membership Fees" },
  { id: "member-access", label: "Member Access & Offer Redemption" },
  { id: "price-changes", label: "Price Changes" },
  { id: "cancellation", label: "Cancellation" },
  { id: "refund-policy", label: "Refund Policy" },
  { id: "partner-businesses", label: "Partner Businesses & Venues" },
  { id: "purchases", label: "Online Purchases & In-Store Transactions" },
  { id: "affiliate-programme", label: "Affiliate Programme" },
  { id: "partner-accounts", label: "Partner Accounts" },
  { id: "acceptable-use", label: "Acceptable Use & Fraud Prevention" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "availability", label: "Platform Availability" },
  { id: "third-party-services", label: "Third-Party Services" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "privacy", label: "Privacy" },
  { id: "changes", label: "Changes to These Terms" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact" },
];

const foodVaultIsNot = [
  "an online supermarket or grocery store",
  "a retailer or direct product manufacturer",
  "a marketplace checkout processor for partner goods",
  "a payment intermediary for retail or dining transactions",
  "a food delivery, courier, or fulfilment service",
  "a venue, cafe, bar, or restaurant operator",
];

const memberEligibility = [
  "provide accurate and truthful information",
  "comply with these Terms",
  "have the legal capacity to enter into these Terms or have any consent required by law to use the Platform or purchase a membership",
];

const partnerEligibility = [
  "be legally entitled to operate their business, online store, or physical commercial premises in New Zealand",
  "maintain appropriate health, safety, food hygiene, licensing, and payment channels for accepting customer orders and venue patrons",
  "comply with all applicable local laws, food safety regulations, and trading standards",
];

const accountResponsibilities = [
  "keep your login credentials confidential",
  "provide accurate and current information",
  "update information promptly when changes occur",
  "notify FoodVault immediately if you believe your account or digital membership pass has been accessed without authorisation",
];

const membershipBenefits = [
  "member-only digital promo codes for online partner brands",
  "live digital membership verification passes for in-person hospitality venue discounts",
  "exclusive partner promotions and member perks",
  "brand and local venue discovery features",
  "other membership benefits made available from time to time",
];

const partnerResponsibilities = [
  "setting and honoring advertised discounts or member perks",
  "product and menu information, pricing, and availability",
  "food preparation, quality, allergens, and food safety standards",
  "order processing, fulfillment, delivery, and shipping (for online purchases)",
  "venue seating, service, POS discount application, and counter operations",
  "customer support, warranties, returns, and refunds relating to their products or hospitality services",
];

const foodVaultDoesNotGuarantee = [
  "real-time stock levels, table availability, or opening hours of partner venues",
  "pricing accuracy or perpetual availability of specific menu items/products",
  "partner venue staff performance or service quality",
];

const acceptableUseProhibitions = [
  "misuse the Platform or attempt unauthorised access to system infrastructure",
  "present static screenshots, screen recordings, or counterfeit representations of the live digital membership pass at partner venues",
  "publicly post, resell, or distribute member-exclusive online discount codes",
  "share account credentials to allow non-paying third parties to claim in-store or online member perks",
  "scrape, crawl, or harvest Platform data using automated tools",
  "impersonate another person or business entity",
  "use FoodVault for any unlawful, fraudulent, or unauthorised commercial purposes",
];

const ipOwnership = [
  "the Platform, software code, dynamic pass verification technology, and databases",
  "FoodVault branding, trademarks, logos, graphics, copy, and UI/UX designs",
];

const liabilityExclusions = [
  "your use of, or inability to use, the Platform or digital membership pass",
  "products, food, beverages, or services consumed or purchased from partner businesses or venues",
  "acts, omissions, food safety failures, or conduct of any partner venue or brand",
  "unauthorized access to or alteration of your account transmissions",
];

export function TermsContent() {
  return (
    <LegalDocShell
      badge="Legal Framework"
      title="Terms & Conditions"
      lastUpdated="August 2026"
      intro={
        <>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to
          and use of the FoodVault website, membership platform, digital pass
          verification system, and related services (&ldquo;Platform&rdquo;).
        </>
      }
      sidebarTitle="Quick Navigation"
      navItems={navItems}
      heroExtra={
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </span>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                FoodVault is operated by:
                <br />
                <span className="font-semibold text-foreground">
                  Britomart Groceries Limited
                  <br />
                  Trading as FoodVault
                </span>
                <br />
                A New Zealand registered company.
              </p>
              <p>
                By creating an account, purchasing a membership, creating a partner
                account, joining the affiliate programme, accessing the Platform, or
                otherwise using our services, you agree to these Terms.
              </p>
              <p>
                If you do not agree with these Terms, you must not use the Platform.
              </p>
            </div>
          </div>
        </div>
      }
      footerNote={
        <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Nothing in these Terms limits rights that cannot legally be excluded under
          New Zealand law, including your rights under the Consumer Guarantees Act 1993
          and the Fair Trading Act 1986 where applicable.
        </p>
      }
    >
      <LegalSection id="about" number="01" title="About FoodVault">
        <p>
          FoodVault is a membership and discovery platform that helps consumers discover
          New Zealand food, beverage, and household brands, as well as local hospitality
          venues (including cafes, restaurants, bakeries, bars, and delis), while accessing
          exclusive member discounts and offers provided by participating partner businesses.
        </p>
        <p>FoodVault is not:</p>
        <ul className="list-disc space-y-2 pl-5">
          {foodVaultIsNot.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault does not sell physical products or food items directly. FoodVault only
          sells subscription access to its membership platform.
        </p>
        <p>
          All online product purchases are completed directly with independent partner
          businesses through their own websites. All in-store purchases and dining
          transactions occur directly at the physical venues of participating hospitality
          partners.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" number="02" title="Eligibility">
        <p>To use FoodVault as a Member, you must:</p>
        <ul className="list-disc space-y-2 pl-5">
          {memberEligibility.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Partner businesses (Online Brands and Hospitality Venues) must:</p>
        <ul className="list-disc space-y-2 pl-5">
          {partnerEligibility.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Affiliate accounts are available to eligible individuals and businesses who
          wish to promote FoodVault or participating partners.
        </p>
        <p>
          Membership is not required to participate in the affiliate programme unless
          specifically stated.
        </p>
      </LegalSection>

      <LegalSection id="accounts" number="03" title="Accounts">
        <p>You are responsible for maintaining the security of your account credentials.</p>
        <p>You agree to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {accountResponsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          You remain responsible for all activity occurring under your account.
        </p>
        <p>
          FoodVault may suspend or terminate accounts where we reasonably believe there
          has been misuse, screenshot sharing, fraud, security breaches, or non-compliance
          with these Terms.
        </p>
      </LegalSection>

      <LegalSection id="membership" number="04" title="Membership">
        <p>FoodVault currently offers subscription access to the FoodVault Membership.</p>
        <p>Membership provides access to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {membershipBenefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Membership benefits may change as the Platform evolves.
        </p>
        <p>
          FoodVault does not guarantee that membership will result in specific monetary
          savings or that member offers will always represent the absolute lowest available
          price in the market.
        </p>
      </LegalSection>

      <LegalSection id="membership-fees" number="05" title="Membership Fees">
        <p>Membership is billed as a recurring monthly subscription.</p>
        <p>
          Current pricing is displayed during signup before payment confirmation.
        </p>
        <p>
          By subscribing, you authorise FoodVault to charge your selected payment method
          each billing cycle until your subscription is cancelled.
        </p>
        <p>Membership fees include applicable taxes (GST) where required.</p>
        <p>Payments are securely processed by Stripe.</p>
        <p>FoodVault does not store complete payment card details.</p>
      </LegalSection>

      <LegalSection id="member-access" number="06" title="Member Access & Offer Redemption">
        <p>
          Anyone may browse participating brand profiles, local venue listings, and view
          advertised member perks without paying. Revealing/copying online promo codes or
          accessing the live in-store digital membership screen requires an active, paid
          membership.
        </p>
        <p className="font-semibold text-foreground">Redemption Mechanics:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Online Offers:</span> Members
            unlock and copy unique promo codes on the Platform to apply at checkout on the
            partner brand&apos;s website.
          </li>
          <li>
            <span className="font-semibold text-foreground">In-Store / Hospitality Offers:</span>{" "}
            Members must present their active digital membership screen on their personal
            mobile device to staff at the venue&apos;s counter or payment point before
            transaction completion.
          </li>
          <li>
            <span className="font-semibold text-foreground">Verification Security:</span>{" "}
            In-store membership passes display dynamic, live clock elements. Static
            screenshots, video recordings, printed copies, or shared logins are strictly
            invalid and will be rejected by partner venues.
          </li>
        </ul>
        <p>
          Membership access begins immediately upon successful payment confirmation.
        </p>
      </LegalSection>

      <LegalSection id="price-changes" number="07" title="Price Changes">
        <p>FoodVault may change membership subscription pricing from time to time.</p>
        <p>
          Where pricing changes affect existing active members, FoodVault will provide
          reasonable advance notice before updated pricing applies.
        </p>
        <p>
          Continued use of the Platform after a price change takes effect constitutes
          acceptance of the updated membership fee.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" number="08" title="Cancellation">
        <p>
          You may cancel your membership at any time through your FoodVault account
          settings or via the Stripe Customer Billing Portal.
        </p>
        <p>Cancellation prevents future automatic billing.</p>
        <p>
          Your membership remains active until the end of your current paid billing
          period.
        </p>
        <p>
          Cancelling your membership does not automatically entitle you to a refund for
          the remaining duration of the current billing period.
        </p>
      </LegalSection>

      <LegalSection id="refund-policy" number="09" title="Refund Policy">
        <p>Membership fees are generally non-refundable once charged.</p>
        <p>
          Where required by applicable law, FoodVault will provide refunds in
          accordance with the Consumer Guarantees Act 1993, the Fair Trading Act 1986,
          and other applicable New Zealand legislation.
        </p>
        <p>
          Refund requests may be submitted through the{" "}
          <Link href="/contact" className="font-semibold text-primary hover:text-primary-hover">
            Contact page
          </Link>{" "}
          or by emailing{" "}
          <a
            href="mailto:mark@benchmark-int.com"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            mark@benchmark-int.com
          </a>
          .
        </p>
        <p>
          Refunds do not apply to products, food, beverages, or services purchased
          directly from partner businesses or hospitality venues.
        </p>
      </LegalSection>

      <LegalSection id="partner-businesses" number="10" title="Partner Businesses & Venues">
        <p>Each partner business and hospitality venue operates independently from FoodVault.</p>
        <p>Partners are solely responsible for:</p>
        <ul className="list-disc space-y-2 pl-5">
          {partnerResponsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>FoodVault does not guarantee:</p>
        <ul className="list-disc space-y-2 pl-5">
          {foodVaultDoesNotGuarantee.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Partner offers and perks may change, expire, or be updated by the partner
          business in accordance with platform guidelines.
        </p>
      </LegalSection>

      <LegalSection id="purchases" number="11" title="Purchases & In-Person Transactions">
        <p>
          <span className="font-semibold text-foreground">Online Purchases:</span> When you
          leave FoodVault and visit a partner website, you enter into a direct commercial
          transaction with that independent business. Their terms, privacy policies, and
          return policies govern the purchase.
        </p>
        <p>
          <span className="font-semibold text-foreground">In-Store &amp; Dining Transactions:</span>{" "}
          When you visit a participating hospitality venue, all food, beverage, and service
          transactions occur directly between you and the venue. The venue is solely
          responsible for applying the member discount to your bill upon presentation of a
          valid, live FoodVault membership pass.
        </p>
        <p>
          <span className="font-semibold text-foreground">Disputes:</span> FoodVault is not
          a party to transactions executed with partner brands or venues. Any product
          defects, service complaints, order disputes, or refund requests regarding
          goods/dining must be resolved directly with the relevant partner business.
        </p>
      </LegalSection>

      <LegalSection id="affiliate-programme" number="12" title="Affiliate Programme">
        <p>FoodVault may offer an optional affiliate programme.</p>
        <p>
          Participation is subject to the{" "}
          <Link href="/affiliate-terms" className="font-semibold text-primary hover:text-primary-hover">
            Affiliate Programme Terms &amp; Conditions
          </Link>
          .
        </p>
        <p>
          FoodVault may approve, reject, suspend, or terminate affiliate accounts where
          misuse, fraud, prohibited activity, or breaches of these Terms are identified.
        </p>
        <p>
          Affiliate commissions are payable only where transactions meet applicable
          programme requirements.
        </p>
      </LegalSection>

      <LegalSection id="partner-accounts" number="13" title="Partner Accounts">
        <p>
          Partners remain responsible for ensuring that they have the necessary rights,
          licenses, and permissions to provide FoodVault with business information, trading
          names, logos, menu items, gallery images, videos, marketing materials, or other
          content submitted to the Platform.
        </p>
        <p>Partners retain ownership of their intellectual property.</p>
        <p>
          By submitting content to FoodVault, Partners grant FoodVault a non-exclusive,
          royalty-free licence to use, reproduce, display, publish, distribute, and share
          that content for the purpose of operating, displaying, and promoting the Partner,
          the Partner&apos;s venue/products, and the FoodVault Platform.
        </p>
        <p>
          This licence includes use of submitted content on the FoodVault website and app,
          social media channels, email marketing, advertising, public relations, and
          promotional activities.
        </p>
        <p>
          FoodVault may reasonably resize, crop, or format submitted content for layout
          purposes without materially altering the underlying substance.
        </p>
        <p>
          Partners may request that FoodVault cease using submitted content for future
          marketing by contacting FoodVault. This does not require FoodVault to recall or
          destroy materials already published or distributed prior to the request.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" number="14" title="Acceptable Use & Fraud Prevention">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {acceptableUseProhibitions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault or partner venue staff reserve the right to verify live membership
          screens. FoodVault may immediately suspend or terminate accounts identified in
          breach of these rules without refund.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" number="15" title="Intellectual Property">
        <p>FoodVault owns all legal rights, title, and interest in:</p>
        <ul className="list-disc space-y-2 pl-5">
          {ipOwnership.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Partner business names, trademarks, menus, and product images remain the property
          of their respective owners.
        </p>
        <p>
          Nothing in these Terms transfers ownership of any intellectual property.
        </p>
      </LegalSection>

      <LegalSection id="availability" number="16" title="Platform Availability">
        <p>
          FoodVault aims to maintain high Platform availability but does not guarantee
          uninterrupted operation.
        </p>
        <p>
          Maintenance, software upgrades, network security events, or third-party
          infrastructure failures may temporarily affect platform availability or live
          digital pass rendering.
        </p>
      </LegalSection>

      <LegalSection id="third-party-services" number="17" title="Third-Party Services">
        <p>
          The Platform relies on external third-party infrastructure, including payment
          gateways (Stripe), hosting providers, mapping/location services, and security
          verification tools (e.g., Cloudflare).
        </p>
        <p>
          FoodVault is not responsible for interruptions, errors, or service delays caused
          by third-party systems outside our reasonable control.
        </p>
      </LegalSection>

      <LegalSection id="liability" number="18" title="Limitation of Liability">
        <div className="rounded-lg bg-navy p-6 text-white sm:p-8">
          <p className="leading-relaxed text-white/90">
            To the maximum extent permitted by New Zealand law, FoodVault (and its
            directors, officers, and employees) shall not be liable for any indirect,
            incidental, consequential, special, or punitive damages arising from:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-white/90">
            {liabilityExclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-white/90">
            FoodVault&apos;s maximum aggregate liability relating to the Platform will
            not exceed the total membership fees paid by the affected member during the
            twelve (12) months immediately preceding the event giving rise to the claim.
          </p>
          <p className="mt-4 leading-relaxed text-white/90">
            Nothing in these Terms limits rights that cannot legally be excluded under
            New Zealand law, including the Consumer Guarantees Act 1993 and the Fair
            Trading Act 1986.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="privacy" number="19" title="Privacy">
        <p>
          Your use of the Platform is governed by the FoodVault{" "}
          <Link href="/privacy" className="font-semibold text-primary hover:text-primary-hover">
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          The Privacy Policy details how personal information (including account
          credentials and location data where applicable) is collected, stored, used, and
          protected in compliance with the New Zealand Privacy Act 2020.
        </p>
      </LegalSection>

      <LegalSection id="changes" number="20" title="Changes to These Terms">
        <p>
          FoodVault may update these Terms from time to time to reflect platform
          improvements or business changes.
        </p>
        <p>
          Material changes will be published on the Platform and, where appropriate,
          notified via email.
        </p>
        <p>
          Continued use of the Platform after changes take effect constitutes binding
          acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" number="21" title="Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws of New
          Zealand.
        </p>
        <p>
          Any legal dispute or claim arising under or in connection with these Terms or
          the Platform shall be subject to the exclusive jurisdiction of the courts of New
          Zealand.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="22" title="Contact">
        <div className="rounded-lg bg-primary p-6 text-center text-white sm:p-10">
          <h3 className="text-xl font-bold sm:text-2xl">FoodVault is operated by</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:text-base">
            Britomart Groceries Limited
            <br />
            Trading as FoodVault
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/80 sm:text-base">
            General enquiries, member support, business partner enquiries, and
            legal/privacy notices may be submitted via the{" "}
            <Link href="/contact" className="font-semibold text-white underline hover:text-white/90">
              Contact page
            </Link>{" "}
            on the Platform or by emailing:
          </p>
          <a
            href="mailto:mark@benchmark-int.com"
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            mark@benchmark-int.com
          </a>
        </div>
      </LegalSection>
    </LegalDocShell>
  );
}
