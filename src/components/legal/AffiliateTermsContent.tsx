import Link from "next/link";
import {
  LegalDocShell,
  LegalSection,
} from "@/components/legal/LegalDocShell";

const navItems = [
  { id: "about", label: "1. About the Affiliate Programme" },
  { id: "eligibility", label: "2. Eligibility" },
  { id: "dashboard", label: "3. Affiliate Dashboard and Referral Links" },
  { id: "partner-programmes", label: "4. Partner Affiliate Programmes" },
  { id: "commissions", label: "5. Commission Payments" },
  { id: "responsibilities", label: "6. Affiliate Responsibilities" },
  { id: "prohibited", label: "7. Prohibited Activities" },
  { id: "intellectual-property", label: "8. Brand Assets and Intellectual Property" },
  { id: "relationship", label: "9. Relationship Between FoodVault, Affiliates and Partners" },
  { id: "liability-role", label: "10. FoodVault's Role and Liability" },
  { id: "termination", label: "11. Suspension and Termination" },
  { id: "earnings", label: "12. No Guarantee of Earnings" },
  { id: "changes", label: "13. Changes to the Affiliate Programme" },
  { id: "limitation", label: "14. Limitation of Liability" },
  { id: "privacy", label: "15. Privacy" },
  { id: "governing-law", label: "16. Governing Law" },
  { id: "contact", label: "17. Contact" },
];

const programmeAccess = [
  "an Affiliate Dashboard",
  "referral links",
  "promotional tools",
  "tracking information",
  "available affiliate offers from participating partners",
];

const eligibilityRequirements = [
  "provide accurate account information",
  "use the Programme for lawful purposes",
  "comply with these Affiliate Terms",
  "comply with all applicable advertising, consumer protection and privacy laws",
];

const dashboardFeatures = [
  "view available affiliate programmes",
  "generate referral links",
  "access approved promotional materials",
  "monitor referral activity where available",
];

const referralLinkProhibitions = [
  "modify referral links to hide their source",
  "create misleading tracking links",
  "interfere with tracking systems",
  "encourage fraudulent clicks or conversions",
];

const partnerProgrammeTerms = [
  "commission rates",
  "eligibility requirements",
  "promotional rules",
  "payment terms",
  "cancellation policies",
  "tracking requirements",
];

const commissionNotGuaranteed = [
  "that commissions will be available",
  "that referrals will result in commissions",
  "specific commission rates",
  "payment amounts",
  "continued availability of any affiliate programme",
];

const commissionWithheldReasons = [
  "transactions are cancelled",
  "refunds occur",
  "fraud is suspected",
  "programme requirements are not met",
  "prohibited promotional methods are used",
];

const marketingRequirements = [
  "accurate",
  "truthful",
  "transparent",
  "compliant with applicable laws",
];

const misleadingStatementsProhibited = [
  "FoodVault",
  "partner businesses",
  "products",
  "discounts",
  "pricing",
  "commissions",
  "potential earnings",
];

const prohibitedActivities = [
  "engage in spam marketing",
  "send unsolicited messages",
  "create misleading advertisements",
  "impersonate FoodVault, partner businesses or other Affiliates",
  "use brand names, trademarks or logos without permission",
  "claim to represent FoodVault unless authorised",
  "create fake reviews or testimonials",
  "use deceptive redirects or tracking methods",
  "manipulate clicks, impressions or conversions",
  "encourage fraudulent transactions",
  "self-refer using their own referral links where prohibited",
  "distribute private discount codes publicly where prohibited",
  "engage in unlawful or unethical marketing practices",
];

const brandAssets = [
  "trademarks",
  "logos",
  "branding",
  "images",
  "marketing materials",
  "content",
];

const noRelationshipCreated = [
  "an employment relationship",
  "agency relationship",
  "partnership",
  "joint venture",
];

const foodVaultNotResponsible = [
  "Affiliate marketing activities",
  "Affiliate communications",
  "Affiliate claims or statements",
  "misuse of referral links",
  "breaches of law by Affiliates",
  "disputes between Affiliates and customers",
  "disputes between Affiliates and partner businesses",
];

const terminationReasons = [
  "these Affiliate Terms have been breached",
  "fraudulent activity has occurred",
  "the Affiliate Programme has been abused",
  "misleading or harmful promotion has occurred",
  "an Affiliate's conduct may damage FoodVault, partners or customers",
];

const earningsFactors = [
  "promotional methods",
  "audience engagement",
  "customer behaviour",
  "partner programme availability",
];

const programmeChanges = [
  "available partners",
  "commission structures",
  "tracking methods",
  "programme features",
  "eligibility requirements",
];

const liabilityExclusions = [
  "lost commissions",
  "lost income",
  "indirect losses",
  "business interruption",
  "actions of partner businesses",
  "actions of other Affiliates",
  "third-party platform failures",
];

export function AffiliateTermsContent() {
  return (
    <LegalDocShell
      badge="Legal Framework"
      title="Affiliate Programme Terms & Conditions"
      lastUpdated="July 2026"
      intro={
        <>
          These Affiliate Programme Terms &amp; Conditions (&ldquo;Affiliate
          Terms&rdquo;) govern participation in the FoodVault Affiliate Programme
          (&ldquo;Affiliate Programme&rdquo;).
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
                The Affiliate Programme is operated by:
                <br />
                <span className="font-semibold text-foreground">
                  Britomart Groceries Limited
                  <br />
                  Trading as FoodVault
                </span>
                <br />
                (&ldquo;FoodVault&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
                &ldquo;us&rdquo;)
              </p>
              <p>
                By creating an Affiliate account, accessing the Affiliate Dashboard,
                generating referral links, promoting FoodVault or participating partner
                businesses, you agree to these Affiliate Terms.
              </p>
              <p>
                If you do not agree to these Affiliate Terms, you must not participate
                in the Affiliate Programme.
              </p>
            </div>
          </div>
        </div>
      }
      footerNote={
        <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Participation in the Affiliate Programme does not guarantee income or
          commissions. Nothing in these Affiliate Terms limits rights that cannot
          legally be excluded under New Zealand law.
        </p>
      }
    >
      <LegalSection id="about" number="01" title="About the Affiliate Programme">
        <p>
          The FoodVault Affiliate Programme allows individuals and businesses
          (&ldquo;Affiliates&rdquo;) to promote participating FoodVault partner
          businesses and, where applicable, earn commissions from qualifying referrals.
        </p>
        <p>The Affiliate Programme provides Affiliates with access to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {programmeAccess.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Affiliate access is provided free of charge.</p>
        <p>
          No purchase or FoodVault membership is required to become an Affiliate unless
          specifically stated.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" number="02" title="Eligibility">
        <p>To participate in the Affiliate Programme, you must:</p>
        <ul className="list-disc space-y-2 pl-5">
          {eligibilityRequirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault may approve, reject or restrict Affiliate accounts at its discretion.
        </p>
        <p>
          Creating an Affiliate account does not guarantee access to every partner
          affiliate programme.
        </p>
      </LegalSection>

      <LegalSection id="dashboard" number="03" title="Affiliate Dashboard and Referral Links">
        <p>Approved Affiliates may access an Affiliate Dashboard where they can:</p>
        <ul className="list-disc space-y-2 pl-5">
          {dashboardFeatures.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Referral links are provided solely for legitimate promotional purposes.
        </p>
        <p>Affiliates must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          {referralLinkProhibitions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="partner-programmes" number="04" title="Partner Affiliate Programmes">
        <p>
          FoodVault may display affiliate opportunities from participating partner
          businesses on their FoodVault profiles.
        </p>
        <p>Each partner business may establish its own:</p>
        <ul className="list-disc space-y-2 pl-5">
          {partnerProgrammeTerms.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault does not control individual partner affiliate programmes unless
          specifically stated.
        </p>
        <p>
          Participation in a partner affiliate programme may require separate acceptance
          of that partner&apos;s affiliate terms.
        </p>
      </LegalSection>

      <LegalSection id="commissions" number="05" title="Commission Payments">
        <p>
          Commission payments are determined by the applicable partner affiliate
          programme.
        </p>
        <p>FoodVault does not guarantee:</p>
        <ul className="list-disc space-y-2 pl-5">
          {commissionNotGuaranteed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Commissions may be withheld, reversed or cancelled where:</p>
        <ul className="list-disc space-y-2 pl-5">
          {commissionWithheldReasons.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="responsibilities" number="06" title="Affiliate Responsibilities">
        <p>Affiliates are solely responsible for their promotional activities.</p>
        <p>Affiliates must ensure all marketing activities are:</p>
        <ul className="list-disc space-y-2 pl-5">
          {marketingRequirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Affiliates must not make false or misleading statements about:</p>
        <ul className="list-disc space-y-2 pl-5">
          {misleadingStatementsProhibited.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Affiliates must clearly disclose when they may receive compensation from
          referrals where required by law.
        </p>
      </LegalSection>

      <LegalSection id="prohibited" number="07" title="Prohibited Activities">
        <p>Affiliates must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          {prohibitedActivities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="intellectual-property" number="08" title="Brand Assets and Intellectual Property">
        <p>FoodVault and participating partners retain ownership of their:</p>
        <ul className="list-disc space-y-2 pl-5">
          {brandAssets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Affiliates may only use approved promotional materials for the purpose of
          promoting authorised affiliate offers.
        </p>
        <p>No intellectual property rights are transferred to Affiliates.</p>
      </LegalSection>

      <LegalSection id="relationship" number="09" title="Relationship Between FoodVault, Affiliates and Partners">
        <p>Affiliates are independent participants in the Affiliate Programme.</p>
        <p>Nothing in these Affiliate Terms creates:</p>
        <ul className="list-disc space-y-2 pl-5">
          {noRelationshipCreated.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Affiliates do not have authority to act on behalf of FoodVault or partner
          businesses.
        </p>
        <p>
          Affiliates are responsible for their own taxes, expenses and legal obligations
          arising from their participation.
        </p>
      </LegalSection>

      <LegalSection id="liability-role" number="10" title="FoodVault's Role and Liability">
        <p>
          FoodVault provides the Affiliate Programme platform and tools but does not
          control how Affiliates promote partner businesses.
        </p>
        <p>FoodVault is not responsible for:</p>
        <ul className="list-disc space-y-2 pl-5">
          {foodVaultNotResponsible.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Affiliates remain solely responsible for their own conduct.</p>
      </LegalSection>

      <LegalSection id="termination" number="11" title="Suspension and Termination">
        <p>
          FoodVault may suspend, restrict or terminate an Affiliate account at any time
          where we reasonably believe:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {terminationReasons.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          FoodVault may remove referral links, restrict dashboard access or prevent
          future participation.
        </p>
        <p>
          Termination does not limit any rights or remedies available to FoodVault.
        </p>
      </LegalSection>

      <LegalSection id="earnings" number="12" title="No Guarantee of Earnings">
        <p>
          Participation in the Affiliate Programme does not guarantee income or
          commissions.
        </p>
        <p>Affiliate results depend on many factors including:</p>
        <ul className="list-disc space-y-2 pl-5">
          {earningsFactors.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>FoodVault makes no representations regarding potential earnings.</p>
      </LegalSection>

      <LegalSection id="changes" number="13" title="Changes to the Affiliate Programme">
        <p>
          FoodVault may modify, suspend or discontinue any part of the Affiliate
          Programme at any time.
        </p>
        <p>Changes may include:</p>
        <ul className="list-disc space-y-2 pl-5">
          {programmeChanges.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Where appropriate, Affiliates will be notified of material changes.</p>
      </LegalSection>

      <LegalSection id="limitation" number="14" title="Limitation of Liability">
        <div className="rounded-lg bg-navy p-6 text-white sm:p-8">
          <p className="leading-relaxed text-white/90">
            To the maximum extent permitted by New Zealand law, FoodVault is not liable
            for:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-white/90">
            {liabilityExclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-white/90">
            FoodVault&apos;s maximum liability relating to the Affiliate Programme will
            not exceed commissions paid to the Affiliate by FoodVault during the twelve
            months preceding the event giving rise to the claim.
          </p>
          <p className="mt-4 leading-relaxed text-white/90">
            Nothing in these Affiliate Terms limits rights that cannot legally be
            excluded under New Zealand law.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="privacy" number="15" title="Privacy">
        <p>
          Affiliate information is collected, used and stored in accordance with the
          FoodVault{" "}
          <Link href="/privacy" className="font-semibold text-primary hover:text-primary-hover">
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          By participating in the Affiliate Programme, you consent to FoodVault
          processing information necessary to operate the Programme, including referral
          tracking and commission administration.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" number="16" title="Governing Law">
        <p>These Affiliate Terms are governed by the laws of New Zealand.</p>
        <p>
          Any disputes relating to these Affiliate Terms shall be subject to the
          exclusive jurisdiction of the New Zealand courts.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="17" title="Contact">
        <div className="rounded-lg bg-primary p-6 text-center text-white sm:p-10">
          <h3 className="text-xl font-bold sm:text-2xl">
            FoodVault Affiliate Programme enquiries
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:text-base">
            Britomart Groceries Limited
            <br />
            Trading as FoodVault
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
