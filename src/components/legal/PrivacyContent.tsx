import Link from "next/link";
import {
  LegalDocShell,
  LegalSection,
} from "@/components/legal/LegalDocShell";

const navItems = [
  { id: "who-we-are", label: "1. Who We Are" },
  { id: "information-we-collect", label: "2. Information We Collect" },
  { id: "how-we-use", label: "3. How We Use Your Information" },
  { id: "partner-businesses", label: "4. Partner Businesses" },
  { id: "sharing", label: "5. Sharing Your Information" },
  { id: "international-transfers", label: "6. International Data Transfers" },
  { id: "cookies", label: "7. Cookies and Similar Technologies" },
  { id: "data-security", label: "8. Data Security" },
  { id: "data-retention", label: "9. Data Retention" },
  { id: "your-rights", label: "10. Your Privacy Rights" },
  { id: "account-deletion", label: "11. Account Deletion" },
  { id: "changes", label: "12. Changes to This Privacy Policy" },
  { id: "contact", label: "13. Contact Us" },
];

const accountInformation = [
  "Name",
  "Email address",
  "Password or login credentials (stored securely through our authentication provider)",
  "Account preferences",
  "Saved brands or favourites",
  "Information provided through customer support enquiries",
];

const membershipInformation = [
  "Membership status",
  "Trial status",
  "Subscription dates",
  "Renewal dates",
  "Cancellation information",
  "Membership history",
  "Benefits accessed through the Platform",
];

const paymentNotStored = [
  "Credit card numbers",
  "Debit card numbers",
  "CVC/security codes",
];

const stripeInformation = [
  "Customer identifier",
  "Subscription identifier",
  "Payment status",
  "Subscription renewal information",
];

const partnerAccountInformation = [
  "Business name",
  "Contact details",
  "Brand information",
  "Logos and marketing materials",
  "Website and social media links",
  "Discount offers",
  "Communications relating to your partnership",
];

const affiliateInformation = [
  "Name",
  "Contact information",
  "Affiliate account details",
  "Referral activity",
  "Commission-related information",
];

const technicalInformation = [
  "IP address",
  "Browser type",
  "Device information",
  "Operating system",
  "Pages visited",
  "Usage information",
  "Error logs",
  "Security information",
];

const usePurposes = [
  "Create and manage accounts",
  "Provide membership access",
  "Process subscription payments",
  "Manage free trials",
  "Provide customer support",
  "Respond to enquiries",
  "Operate partner and affiliate accounts",
  "Improve the Platform and user experience",
  "Monitor security and prevent fraud",
  "Detect misuse or unauthorised activity",
  "Comply with legal obligations",
];

const partnerNotResponsible = [
  "Partner websites",
  "Partner privacy practices",
  "Partner cookies or tracking technologies",
  "Information collected by partner businesses",
  "Products purchased from partner businesses",
];

const securityMeasures = [
  "Secure connections and encryption",
  "Authentication controls",
  "Access restrictions",
  "Secure cloud infrastructure",
  "Security monitoring",
  "Regular system updates",
];

const retentionPurposes = [
  "Provide the Platform",
  "Manage memberships",
  "Maintain account records",
  "Process billing information",
  "Resolve disputes",
  "Meet legal and accounting obligations",
];

const privacyRights = [
  "Access to personal information we hold about you",
  "Correction of inaccurate information",
  "Information about how your personal information is handled",
  "Deletion of personal information where appropriate",
];

const accountDeletionEffects = [
  "Your membership access will end",
  "Personal information will be deleted or anonymised where permitted",
  "Information required for legal, accounting or security purposes may be retained",
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
      lastUpdated="July 2026"
      intro={
        <>
          This Privacy Policy explains how Britomart Groceries Limited, trading as
          FoodVault (&ldquo;FoodVault&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
          &ldquo;us&rdquo;), collects, uses, stores and protects personal information
          when you access or use the FoodVault website, membership platform and related
          services (&ldquo;Platform&rdquo;).
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
                starting a free trial, purchasing a membership, creating a partner account,
                joining our affiliate programme, or otherwise using the Platform, you
                acknowledge this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      }
      footerNote={
        <p className="text-center text-sm text-muted-foreground">
          FoodVault does not sell, rent or trade your personal information.
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
          FoodVault is a membership platform that helps consumers discover New Zealand
          food, beverage and household brands while accessing exclusive member discounts
          and offers provided by participating partner businesses.
        </p>
        <p>
          FoodVault does not sell physical products, process retail purchases, or fulfil
          customer orders. Product purchases are completed directly with independent
          partner businesses through their own websites.
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
          Platform, manage accounts and provide membership services.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoSubsection
            title="Account Information"
            intro="When you create an account, we may collect:"
            items={accountInformation}
          />
          <InfoSubsection
            title="Membership Information"
            intro="We may collect information relating to your FoodVault membership, including:"
            items={membershipInformation}
          />
        </div>
        <div className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
          <h3 className="font-bold text-foreground">Payment Information</h3>
          <p className="mt-2">
            FoodVault subscriptions are processed securely through Stripe.
          </p>
          <p className="mt-2">
            FoodVault does not store complete payment card information, including:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {paymentNotStored.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4">
            Stripe may provide limited payment-related information required to manage
            subscriptions, such as:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {stripeInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoSubsection
            title="Partner Account Information"
            intro="If you create a FoodVault Partner account, we may collect:"
            items={partnerAccountInformation}
          />
          <InfoSubsection
            title="Affiliate Information"
            intro="If you participate in the FoodVault Affiliate Programme, we may collect:"
            items={affiliateInformation}
          />
        </div>
        <InfoSubsection
          title="Technical Information"
          intro="When you use the Platform, we may automatically collect information including:"
          items={technicalInformation}
        />
        <p>
          This information helps us maintain security, improve performance and enhance
          the member experience.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use" number="03" title="How We Use Your Information">
        <p>FoodVault uses personal information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {usePurposes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault does not use your information to complete purchases from partner
          businesses.
        </p>
      </LegalSection>

      <LegalSection id="partner-businesses" number="04" title="Partner Businesses">
        <p>
          FoodVault connects members with independent partner businesses.
        </p>
        <p>
          When you click a partner offer or visit a partner website, you leave the
          FoodVault Platform.
        </p>
        <p>
          Any personal information you provide directly to a partner business is
          collected and handled according to that business&apos;s own Privacy Policy
          and Terms.
        </p>
        <p>FoodVault does not control or take responsibility for:</p>
        <ul className="list-disc space-y-2 pl-5">
          {partnerNotResponsible.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault does not receive or store retail purchase information unless required
          for the operation of a specific service.
        </p>
      </LegalSection>

      <LegalSection id="sharing" number="05" title="Sharing Your Information">
        <p>
          FoodVault does not sell, rent or trade your personal information.
        </p>
        <p>
          We only share information where reasonably necessary to operate the Platform.
        </p>
        <p>This may include:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Payment Providers</h3>
            <p className="mt-2">
              Stripe processes subscription payments and manages payment methods on
              FoodVault&apos;s behalf.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Technology Providers</h3>
            <p className="mt-2">We use trusted service providers to support:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Account authentication</li>
              <li>Website hosting</li>
              <li>Database infrastructure</li>
              <li>Platform operation</li>
              <li>Security monitoring</li>
              <li>Technical support</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Analytics and Performance Services</h3>
            <p className="mt-2">
              We may use service providers to help us understand Platform performance,
              identify errors and improve functionality.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Professional Advisers</h3>
            <p className="mt-2">
              We may share information with professional advisers, including accountants,
              lawyers or auditors, where reasonably necessary.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
          <h3 className="font-semibold text-foreground">Legal Requirements</h3>
          <p className="mt-2">
            We may disclose information where required by law or where reasonably
            necessary to:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Comply with legal obligations</li>
            <li>Prevent fraud</li>
            <li>Protect FoodVault</li>
            <li>Protect users</li>
            <li>Protect partner businesses</li>
            <li>
              Enforce our{" "}
              <Link href="/terms" className="font-semibold text-primary hover:text-primary-hover">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
      </LegalSection>

      <LegalSection id="international-transfers" number="06" title="International Data Transfers">
        <p>
          Some service providers used by FoodVault may store or process information
          outside New Zealand.
        </p>
        <p>
          Where this occurs, we take reasonable steps to ensure personal information
          receives appropriate protection consistent with applicable privacy laws.
        </p>
      </LegalSection>

      <LegalSection id="cookies" number="07" title="Cookies and Similar Technologies">
        <p>FoodVault uses cookies and similar technologies to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Keep users signed in</li>
          <li>Maintain account security</li>
          <li>Remember preferences</li>
          <li>Understand Platform usage</li>
          <li>Improve website performance</li>
        </ul>
        <p>
          You can manage cookies through your browser settings. Disabling cookies may
          affect some Platform functionality.
        </p>
      </LegalSection>

      <LegalSection id="data-security" number="08" title="Data Security">
        <p>
          FoodVault takes reasonable technical and organisational measures to protect
          personal information.
        </p>
        <p>These measures may include:</p>
        <ul className="list-disc space-y-2 pl-5">
          {securityMeasures.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          While we take reasonable steps to protect your information, no online service
          can guarantee complete security.
        </p>
      </LegalSection>

      <LegalSection id="data-retention" number="09" title="Data Retention">
        <p>
          FoodVault retains personal information only for as long as reasonably necessary
          to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {retentionPurposes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          When information is no longer required, we may securely delete or anonymise
          it.
        </p>
        <p>Certain records may be retained where required by law.</p>
      </LegalSection>

      <LegalSection id="your-rights" number="10" title="Your Privacy Rights">
        <p>Under the Privacy Act 2020, you may request:</p>
        <ul className="list-disc space-y-2 pl-5">
          {privacyRights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          You may also make a complaint to the Office of the Privacy Commissioner of New
          Zealand if you believe your privacy has been interfered with.
        </p>
        <p>To make a privacy request, contact:</p>
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
        <p>You may request deletion of your FoodVault account.</p>
        <p>When an account is deleted:</p>
        <ul className="list-disc space-y-2 pl-5">
          {accountDeletionEffects.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="changes" number="12" title="Changes to This Privacy Policy">
        <p>FoodVault may update this Privacy Policy from time to time.</p>
        <p>The latest version will always be available on the Platform.</p>
        <p>
          Where significant changes are made, we may notify users through the Platform
          or by email.
        </p>
        <p>
          Continued use of FoodVault after changes take effect means you accept the
          updated Privacy Policy.
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
            For privacy enquiries or requests relating to your personal information:
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
