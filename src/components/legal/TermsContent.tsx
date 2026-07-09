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
  { id: "free-trial", label: "Free Trial" },
  { id: "price-changes", label: "Price Changes" },
  { id: "cancellation", label: "Cancellation" },
  { id: "refund-policy", label: "Refund Policy" },
  { id: "partner-businesses", label: "Partner Businesses" },
  { id: "purchases", label: "Purchases" },
  { id: "affiliate-programme", label: "Affiliate Programme" },
  { id: "partner-accounts", label: "Partner Accounts" },
  { id: "acceptable-use", label: "Acceptable Use" },
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
  "an online supermarket",
  "a retailer",
  "a marketplace checkout",
  "a payment intermediary for retail purchases",
  "a delivery company",
  "a fulfilment service",
];

const memberEligibility = [
  "provide accurate information",
  "comply with these Terms",
  "have the legal capacity to enter into these Terms or have any consent required by law to use the Platform or purchase a membership",
];

const partnerEligibility = [
  "be legally entitled to operate their business",
  "maintain appropriate channels for accepting customer orders where applicable",
  "comply with applicable laws and regulations",
];

const accountResponsibilities = [
  "keep your login credentials confidential",
  "provide accurate and current information",
  "update information when changes occur",
  "notify FoodVault if you believe your account has been accessed without authorisation",
];

const membershipBenefits = [
  "member-only discounts",
  "exclusive partner offers",
  "partner promotions",
  "brand discovery features",
  "other membership benefits made available from time to time",
];

const partnerResponsibilities = [
  "pricing",
  "product information",
  "product availability",
  "order processing",
  "shipping",
  "customer support",
  "warranties",
  "returns",
  "refunds relating to products they sell",
];

const foodVaultDoesNotGuarantee = [
  "availability of products",
  "pricing accuracy",
  "shipping times",
  "stock levels",
  "product quality",
  "partner conduct",
];

const partnerAccountResponsibilities = [
  "maintaining accurate business information",
  "ensuring discounts and offers are valid",
  "complying with advertising and consumer laws",
  "honouring offers displayed on their websites",
  "ensuring submitted content is accurate",
];

const acceptableUseProhibitions = [
  "misuse the Platform",
  "attempt unauthorised access",
  "interfere with Platform security",
  "scrape or copy Platform data",
  "use automated systems without permission",
  "impersonate another person or business",
  "use FoodVault for unlawful purposes",
  "publicly distribute member-only discount codes where prohibited",
];

const ipOwnership = [
  "the Platform",
  "software",
  "branding",
  "logos",
  "graphics",
  "written content",
  "databases",
  "design",
];

const liabilityExclusions = [
  "use of the Platform",
  "partner businesses",
  "third-party websites",
  "products purchased from partners",
  "interruption of services",
];

export function TermsContent() {
  return (
    <LegalDocShell
      badge="Legal Framework"
      title="Terms & Conditions"
      lastUpdated="July 2026"
      intro={
        <>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to
          and use of the FoodVault website, membership platform and related services
          (&ldquo;Platform&rdquo;).
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
                By creating an account, starting a free trial, purchasing a membership,
                creating a partner account, joining the affiliate programme, accessing the
                Platform, or otherwise using our services, you agree to these Terms.
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
          FoodVault is a membership platform that helps consumers discover New Zealand
          food, beverage and household brands while accessing exclusive member discounts
          and offers provided by participating partner businesses.
        </p>
        <p>FoodVault is not:</p>
        <ul className="list-disc space-y-2 pl-5">
          {foodVaultIsNot.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>FoodVault does not sell physical products.</p>
        <p>FoodVault only sells access to its membership platform.</p>
        <p>
          All product purchases are completed directly with independent partner
          businesses through their own websites.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" number="02" title="Eligibility">
        <p>To use FoodVault as a Member, you must:</p>
        <ul className="list-disc space-y-2 pl-5">
          {memberEligibility.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Partner businesses must:</p>
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
        <p>You are responsible for maintaining the security of your account.</p>
        <p>You agree to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {accountResponsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          You remain responsible for activity occurring under your account.
        </p>
        <p>
          FoodVault may suspend or terminate accounts where we reasonably believe there
          has been misuse, fraud, security concerns or a breach of these Terms.
        </p>
      </LegalSection>

      <LegalSection id="membership" number="04" title="Membership">
        <p>FoodVault currently offers subscription access to:</p>
        <p className="font-semibold text-foreground">FoodVault Membership</p>
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
          FoodVault does not guarantee that membership will result in savings or that
          member offers will always represent the lowest available price.
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
        <p>Membership fees include applicable taxes where required.</p>
        <p>Payments are securely processed by Stripe.</p>
        <p>FoodVault does not store complete payment card details.</p>
      </LegalSection>

      <LegalSection id="free-trial" number="06" title="Free Trial">
        <p>Eligible new members may receive a free trial.</p>
        <p>The duration of any trial will be displayed during signup.</p>
        <p>
          By starting a free trial, you acknowledge that your membership will
          automatically convert into a paid monthly subscription at the end of the trial
          period unless cancelled before the trial expiry date.
        </p>
        <p>
          Your nominated payment method will be charged when the trial ends.
        </p>
        <p>
          Only one introductory free trial may be permitted per person unless otherwise
          stated.
        </p>
        <p>
          FoodVault reserves the right to withdraw, modify or limit trial offers at any
          time.
        </p>
      </LegalSection>

      <LegalSection id="price-changes" number="07" title="Price Changes">
        <p>FoodVault may change membership pricing from time to time.</p>
        <p>
          Where pricing changes affect existing members, FoodVault will provide
          reasonable notice before the updated pricing applies.
        </p>
        <p>
          Continued use of the Platform after a price change takes effect constitutes
          acceptance of the updated membership fee.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" number="08" title="Cancellation">
        <p>
          You may cancel your membership at any time through your FoodVault account or
          through the Stripe Customer Billing Portal.
        </p>
        <p>Cancellation prevents future billing.</p>
        <p>
          Your membership remains active until the end of your current paid billing
          period.
        </p>
        <p>
          Cancelling your membership does not automatically entitle you to a refund for
          the current billing period.
        </p>
      </LegalSection>

      <LegalSection id="refund-policy" number="09" title="Refund Policy">
        <p>Membership fees are generally non-refundable once charged.</p>
        <p>
          Where required by applicable law, FoodVault will provide refunds in
          accordance with the Consumer Guarantees Act 1993, the Fair Trading Act 1986
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
          Refunds do not apply to products purchased from partner businesses.
        </p>
      </LegalSection>

      <LegalSection id="partner-businesses" number="10" title="Partner Businesses">
        <p>Each partner business operates independently from FoodVault.</p>
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
        <p>Partner offers may change, expire or be withdrawn without notice.</p>
      </LegalSection>

      <LegalSection id="purchases" number="11" title="Purchases">
        <p>When you leave FoodVault and visit a partner website:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>you enter into a direct transaction with that business</li>
          <li>that business&apos;s Terms, Privacy Policy and return policies apply</li>
          <li>FoodVault is not a party to the transaction</li>
        </ul>
        <p>
          Any disputes relating to purchased products must be resolved directly with
          the relevant partner business.
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
          FoodVault may approve, reject, suspend or terminate affiliate accounts where
          misuse, fraud, prohibited activity or breaches of these Terms are identified.
        </p>
        <p>
          Affiliate commissions are payable only where transactions meet applicable
          programme requirements.
        </p>
      </LegalSection>

      <LegalSection id="partner-accounts" number="13" title="Partner Accounts">
        <p>
          Businesses may create a Partner account free of charge unless otherwise
          stated.
        </p>
        <p>Partners remain responsible for:</p>
        <ul className="list-disc space-y-2 pl-5">
          {partnerAccountResponsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Partners grant FoodVault a non-exclusive licence to use submitted information,
          logos, images and marketing materials for the purpose of operating, displaying
          and promoting their Partner profile within the Platform.
        </p>
        <p>Partners retain ownership of their intellectual property.</p>
        <p>
          Partners retain ownership of all customer relationships and sales generated
          through their own websites.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" number="14" title="Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {acceptableUseProhibitions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault may suspend or terminate accounts that breach these Terms.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" number="15" title="Intellectual Property">
        <p>FoodVault owns all rights in:</p>
        <ul className="list-disc space-y-2 pl-5">
          {ipOwnership.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Partner names, trademarks and product images remain the property of their
          respective owners.
        </p>
        <p>
          Nothing in these Terms transfers ownership of intellectual property.
        </p>
      </LegalSection>

      <LegalSection id="availability" number="16" title="Platform Availability">
        <p>
          FoodVault aims to keep the Platform available but does not guarantee
          uninterrupted operation.
        </p>
        <p>
          Maintenance, upgrades, security events or third-party failures may temporarily
          affect availability.
        </p>
      </LegalSection>

      <LegalSection id="third-party-services" number="17" title="Third-Party Services">
        <p>
          The Platform relies on third-party services including payment processors,
          hosting providers, authentication providers and technology services.
        </p>
        <p>
          FoodVault is not responsible for interruptions, failures or errors caused by
          third-party services outside our reasonable control.
        </p>
      </LegalSection>

      <LegalSection id="liability" number="18" title="Limitation of Liability">
        <div className="rounded-lg bg-navy p-6 text-white sm:p-8">
          <p className="leading-relaxed text-white/90">
            To the maximum extent permitted by New Zealand law, FoodVault is not liable
            for indirect, incidental, consequential, special or punitive damages arising
            from:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-white/90">
            {liabilityExclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-white/90">
            FoodVault&apos;s maximum aggregate liability relating to the Platform will
            not exceed the membership fees paid by the affected member during the twelve
            months immediately preceding the event giving rise to the claim.
          </p>
          <p className="mt-4 leading-relaxed text-white/90">
            Nothing in these Terms limits rights that cannot legally be excluded under
            New Zealand law.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="privacy" number="19" title="Privacy">
        <p>
          Your use of the Platform is also governed by the FoodVault{" "}
          <Link href="/privacy" className="font-semibold text-primary hover:text-primary-hover">
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          The Privacy Policy explains how personal information is collected, used, stored
          and disclosed in accordance with the Privacy Act 2020.
        </p>
      </LegalSection>

      <LegalSection id="changes" number="20" title="Changes to These Terms">
        <p>FoodVault may update these Terms from time to time.</p>
        <p>
          Material changes will be published on the Platform and, where appropriate,
          communicated by email.
        </p>
        <p>
          Continued use of the Platform after changes become effective constitutes
          acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" number="21" title="Governing Law">
        <p>These Terms are governed by the laws of New Zealand.</p>
        <p>
          Any dispute relating to these Terms or the Platform shall be subject to the
          exclusive jurisdiction of the New Zealand courts.
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
            General enquiries, membership support, legal enquiries and privacy requests
            may be submitted through the{" "}
            <Link href="/contact" className="font-semibold text-white underline hover:text-white/90">
              Contact page
            </Link>{" "}
            within the Platform or by emailing:
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
