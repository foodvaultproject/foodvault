import Link from "next/link";
import {
  LegalDocShell,
  LegalSection,
} from "@/components/legal/LegalDocShell";

const navItems = [
  { id: "who-we-are", label: "Who We Are" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "partner-businesses", label: "Partner Businesses & Hospitality Venues" },
  { id: "sharing", label: "Sharing Your Information" },
  { id: "international-transfers", label: "International Data Transfers" },
  { id: "cookies", label: "Cookies and Similar Technologies" },
  { id: "data-security", label: "Data Security" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Privacy Rights" },
  { id: "account-deletion", label: "Account Deletion" },
  { id: "changes", label: "Changes to This Privacy Policy" },
  { id: "contact", label: "Contact Us" },
];

const accountInformation = [
  "Name",
  "Email address",
  "Password or login credentials (stored securely through our authentication provider)",
  "Account preferences",
  "Saved brands, venue favourites, or bookmarked offers",
  "Information provided through customer support enquiries",
];

const membershipInformation = [
  "Membership status (Active, Pending, Cancelled)",
  "Subscription start dates and renewal dates",
  "Cancellation history",
  "Benefits, online promo codes, and in-store digital passes accessed through the Platform",
];

const paymentNotStored = [
  "Credit card numbers",
  "Debit card numbers",
  "CVC/security codes",
];

const stripeInformation = [
  "Customer identifier",
  "Subscription identifier",
  "Payment status and renewal dates",
];

const partnerAccountInformation = [
  "Business trading name and legal company details",
  "Contact details (name, email, phone number)",
  "Physical venue addresses, opening hours, menu highlights, and website links",
  "Brand logos, imagery, and promotional content",
  "Discount offer details",
  "Communications relating to your partnership",
];

const affiliateInformation = [
  "Name and contact information",
  "Affiliate account details and referral activity",
  "Commission payout details",
];

const technicalInformation = [
  "IP address and general geographical location (used for showing nearby venues)",
  "Browser type, operating system, and device details",
  "Pages/listings visited, interaction logs, and error security logs",
];

const usePurposes = [
  "Create and manage member and business accounts",
  "Provide membership access and render live digital passes for counter redemption",
  "Process subscription payments via Stripe",
  "Provide customer and partner support",
  "Improve Platform functionality and local venue discovery features",
  "Monitor security, verify authentic live passes, and prevent discount fraud",
  "Comply with New Zealand legal and accounting obligations",
];

const securityMeasures = [
  "Encrypted HTTPS data transmission (SSL)",
  "Secure authentication mechanisms",
  "Restricted database access controls",
  "Automated security monitoring and threat detection",
];

const privacyRights = [
  "Request access to the personal information we hold about you",
  "Request correction of inaccurate or outdated information",
  "Request information regarding how your data is handled",
];

const accountDeletionEffects = [
  "Your active membership and pass access will immediately terminate",
  "Personal data will be deleted or anonymised, except where retention is required for tax, accounting, or legal compliance",
];

function InfoSubsection({
  title,
  intro,
  items,
}: {
  title: string;
  intro?: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-primary/10 bg-primary/5 p-5 sm:p-6">
      <h3 className="font-bold text-foreground">{title}</h3>
      {intro && <p className="mt-2">{intro}</p>}
      <ul className="mt-3 list-disc space-y-2 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function PrivacyContent() {
  return (
    <LegalDocShell
      title="Privacy Policy"
      lastUpdated="August 2026"
      intro={
        <>
          This Privacy Policy explains how Britomart Groceries Limited, trading as
          FoodVault (&ldquo;FoodVault&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
          &ldquo;us&rdquo;), collects, uses, stores, and protects personal information
          when you access or use the FoodVault website, membership platform, digital
          pass verification system, and related services (&ldquo;Platform&rdquo;).
        </>
      }
      sidebarTitle="Contents"
      navItems={navItems}
      heroExtra={
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>
            <div>
              <h2 className="font-bold text-primary">Our Privacy Commitment</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                FoodVault is committed to protecting your privacy and handling personal
                information responsibly in accordance with the Privacy Act 2020 (New
                Zealand) and applicable privacy requirements. By creating an account,
                purchasing a membership, creating a partner account, joining our affiliate
                programme, or otherwise using the Platform, you acknowledge this Privacy
                Policy.
              </p>
            </div>
          </div>
        </div>
      }
      footerNote={
        <p className="text-center text-sm text-muted-foreground">
          FoodVault does not sell, rent, or trade your personal information.
        </p>
      }
    >
      <LegalSection id="who-we-are" number="01" title="Who We Are">
        <p>FoodVault is operated by:</p>
        <p className="font-semibold text-foreground">
          Britomart Groceries Limited
          <br />
          Trading as FoodVault
        </p>
        <p>
          FoodVault is a membership and discovery platform that helps consumers discover
          New Zealand food, beverage, and household brands, as well as local hospitality
          venues (cafes, restaurants, bakeries, bars, and delis), while accessing exclusive
          member discounts and offers.
        </p>
        <p>
          FoodVault does not sell physical products directly, process retail sales, or
          operate hospitality venues. Product purchases are completed directly on
          independent partner websites, and venue purchases occur directly at participating
          physical locations.
        </p>
        <p>
          For privacy enquiries or requests relating to your personal information,
          contact:
        </p>
        <p>
          Email:{" "}
          <a
            href="mailto:mark@benchmark-int.com"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            mark@benchmark-int.com
          </a>
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" number="02" title="Information We Collect">
        <p>
          FoodVault collects personal information that is necessary to operate the
          Platform, manage accounts, verify active memberships, and provide subscription
          services.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoSubsection
            title="Account Information"
            intro="When you create an account, we may collect:"
            items={accountInformation}
          />
          <InfoSubsection
            title="Membership Information"
            intro="We collect information relating to your FoodVault subscription, including:"
            items={membershipInformation}
          />
        </div>
        <div className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
          <h3 className="font-bold text-foreground">Payment Information</h3>
          <p className="mt-2">
            FoodVault subscriptions are processed securely through Stripe. FoodVault does
            not store complete payment card information, including credit/debit card
            numbers or CVC security codes.
          </p>
          <p className="mt-2">FoodVault does not store:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {paymentNotStored.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4">
            Stripe provides us with limited information required to manage subscriptions,
            such as:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {stripeInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoSubsection
            title="Partner Business & Venue Account Information"
            intro="If you create a FoodVault Business/Partner account (for an Online Brand or Hospitality Venue), we may collect:"
            items={partnerAccountInformation}
          />
          <InfoSubsection
            title="Affiliate Information"
            intro="If you participate in the FoodVault Affiliate Programme, we collect:"
            items={affiliateInformation}
          />
        </div>
        <InfoSubsection
          title="Technical Information"
          intro="When you use the Platform, we automatically collect technical information, including:"
          items={technicalInformation}
        />
      </LegalSection>

      <LegalSection id="how-we-use" number="03" title="How We Use Your Information">
        <p>FoodVault uses personal information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {usePurposes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault does not collect, process, or track your payment transaction data when
          you purchase goods on a partner website or pay at a venue counter.
        </p>
      </LegalSection>

      <LegalSection id="partner-businesses" number="04" title="Partner Businesses & Hospitality Venues">
        <p>
          FoodVault connects members with independent online brands and physical
          hospitality venues.
        </p>
        <p>
          <span className="font-semibold text-foreground">Online Brands:</span> When you
          click an online offer and visit a partner website, you leave the FoodVault
          Platform. Information provided on their site is governed by their own privacy
          policies.
        </p>
        <p>
          <span className="font-semibold text-foreground">Hospitality Venues:</span> When
          you visit a physical venue (cafe, restaurant, bakery, deli), displaying your live
          digital membership pass is a visual verification check. FoodVault does not
          transfer your personal contact information to venue staff during counter checks.
        </p>
        <p>
          FoodVault does not control or take responsibility for independent partner
          websites, venue operations, partner privacy practices, or goods/services provided
          by partners.
        </p>
      </LegalSection>

      <LegalSection id="sharing" number="05" title="Sharing Your Information">
        <p>
          FoodVault does not sell, rent, or trade your personal information. We only share
          information where reasonably necessary to operate the Platform:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Payment Processors</h3>
            <p className="mt-2">
              Stripe processes subscription payments and manages billing portals.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Technology &amp; Infrastructure Providers</h3>
            <p className="mt-2">
              Trusted vendors supporting account authentication, cloud hosting, database
              management, mapping services, and security monitoring (e.g., Cloudflare).
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Professional Advisers</h3>
            <p className="mt-2">
              Accountants, legal counsel, or auditors where reasonably necessary for
              compliance.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Legal Requirements</h3>
            <p className="mt-2">
              Where required by New Zealand law or court orders to protect users, prevent
              platform fraud, or enforce our{" "}
              <Link href="/terms" className="font-semibold text-primary hover:text-primary-hover">
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="international-transfers" number="06" title="International Data Transfers">
        <p>
          Some trusted technology service providers used by FoodVault may store or process
          data on cloud infrastructure located outside New Zealand.
        </p>
        <p>
          Where this occurs, we ensure personal information receives appropriate protection
          consistent with the New Zealand Privacy Act 2020.
        </p>
      </LegalSection>

      <LegalSection id="cookies" number="07" title="Cookies and Similar Technologies">
        <p>FoodVault uses cookies and session storage to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Keep members securely signed in</li>
          <li>Remember user preferences and saved venues</li>
          <li>Verify active membership status when loading digital passes</li>
          <li>Analyze platform performance and fix technical errors</li>
        </ul>
        <p>
          You can manage cookies through your browser settings. Disabling essential cookies
          may prevent you from logging in or displaying your live membership pass.
        </p>
      </LegalSection>

      <LegalSection id="data-security" number="08" title="Data Security">
        <p>
          FoodVault implements reasonable technical and organisational security controls,
          including:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {securityMeasures.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          While we take robust precautions, no digital service can guarantee 100% absolute
          security against all external threats.
        </p>
      </LegalSection>

      <LegalSection id="data-retention" number="09" title="Data Retention">
        <p>
          FoodVault retains personal information only for as long as necessary to provide
          membership services, manage business partnerships, resolve disputes, and meet
          tax/accounting obligations.
        </p>
        <p>
          When personal information is no longer required, it is securely deleted or
          anonymised.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" number="10" title="Your Privacy Rights">
        <p>Under the Privacy Act 2020, you have the right to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {privacyRights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          You also have the right to lodge a complaint with the Office of the Privacy
          Commissioner (New Zealand) if you believe your privacy rights have been
          infringed.
        </p>
        <p>To submit a privacy request, contact:</p>
        <p>
          Email:{" "}
          <a
            href="mailto:mark@benchmark-int.com"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            mark@benchmark-int.com
          </a>
        </p>
      </LegalSection>

      <LegalSection id="account-deletion" number="11" title="Account Deletion">
        <p>
          You may request the deletion of your FoodVault account at any time through
          account settings or by contacting support.
        </p>
        <p>Upon account deletion:</p>
        <ul className="list-disc space-y-2 pl-5">
          {accountDeletionEffects.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="changes" number="12" title="Changes to This Privacy Policy">
        <p>FoodVault may update this Privacy Policy periodically.</p>
        <p>
          Updated versions will be published on the Platform with a revised &ldquo;Last
          Updated&rdquo; date.
        </p>
        <p>
          Continued use of FoodVault after updates take effect indicates acceptance of the
          revised policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="13" title="Contact Us">
        <div className="rounded-lg bg-primary p-6 text-center text-white sm:p-10">
          <h3 className="text-xl font-bold sm:text-2xl">FoodVault is operated by</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:text-base">
            Britomart Groceries Limited
            <br />
            Trading as FoodVault
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/80 sm:text-base">
            For any privacy-related questions or data requests:
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
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center justify-center text-sm font-semibold text-white underline hover:text-white/90"
          >
            Contact page
          </Link>
        </div>
      </LegalSection>
    </LegalDocShell>
  );
}
