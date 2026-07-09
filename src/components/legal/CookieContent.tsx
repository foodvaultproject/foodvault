import Link from "next/link";
import {
  LegalDocShell,
  LegalSection,
} from "@/components/legal/LegalDocShell";

const navItems = [
  { id: "what-are-cookies", label: "1. What Are Cookies?" },
  { id: "why-we-use", label: "2. Why FoodVault Uses Cookies" },
  { id: "types", label: "3. Types of Cookies We Use" },
  { id: "third-party", label: "4. Third-Party Services" },
  { id: "managing", label: "5. Managing Cookies" },
  { id: "consent-changes", label: "6. Consent and Changes to This Policy" },
  { id: "contact", label: "7. Contact Us" },
];

const cookiePurposes = [
  "remember preferences",
  "keep users signed in",
  "maintain security",
  "understand how visitors use the Platform",
  "improve functionality and performance",
];

const whyFoodVaultUsesCookies = [
  {
    title: "Keep You Signed In",
    description:
      "Cookies help maintain secure login sessions and allow members to access their accounts.",
  },
  {
    title: "Maintain Security",
    description:
      "Cookies help protect accounts, detect suspicious activity and maintain Platform security.",
  },
  {
    title: "Remember Preferences",
    description:
      "Cookies may remember settings and preferences to improve your experience.",
  },
  {
    title: "Improve Platform Performance",
    description:
      "Cookies help us understand how the Platform is used and identify opportunities to improve functionality and reliability.",
  },
  {
    title: "Support Subscription Services",
    description:
      "Cookies may assist with secure subscription management and payment processes.",
  },
];

const essentialCookieSupport = [
  "account authentication",
  "secure login sessions",
  "account security",
  "core Platform functionality",
];

const functionalCookieSupport = [
  "saved preferences",
  "user settings",
  "personalised Platform features",
];

const analyticsInformation = [
  "pages visited",
  "general usage patterns",
  "technical performance information",
];

const browserControls = [
  "block cookies",
  "delete existing cookies",
  "block third-party cookies",
  "receive notifications before cookies are stored",
];

const cookieTypes = [
  {
    title: "Essential Cookies",
    borderClass: "border-l-primary",
    intro: "These cookies are required for the Platform to function.",
    supportLabel: "They support:",
    points: essentialCookieSupport,
    note: "Disabling essential cookies may prevent you from accessing certain FoodVault features.",
  },
  {
    title: "Functional Cookies",
    borderClass: "border-l-success",
    intro: "These cookies help remember preferences and improve your experience.",
    supportLabel: "They may support:",
    points: functionalCookieSupport,
  },
  {
    title: "Analytics Cookies",
    borderClass: "border-l-teal-500",
    intro:
      "Where enabled, analytics cookies help us understand how members use the Platform.",
    supportLabel: "This information may include:",
    points: analyticsInformation,
    note: "Analytics information is used to improve the Platform and is not used to identify individual members.",
  },
  {
    title: "Marketing Cookies",
    borderClass: "border-l-red-500",
    intro:
      "FoodVault does not currently use marketing cookies for advertising purposes.",
    note: "If this changes in the future, this Cookie Policy will be updated and appropriate consent will be obtained where required.",
  },
];

export function CookieContent() {
  return (
    <LegalDocShell
      title="Cookie Policy"
      lastUpdated="July 2026"
      intro={
        <>
          This Cookie Policy explains how Britomart Groceries Limited, trading as
          FoodVault (&ldquo;FoodVault&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
          &ldquo;us&rdquo;), uses cookies and similar technologies when you visit the
          FoodVault website, membership platform and related services
          (&ldquo;Platform&rdquo;).
        </>
      }
      sidebarTitle="On This Page"
      navItems={navItems}
      heroExtra={
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          This policy should be read together with our{" "}
          <Link href="/privacy" className="font-semibold text-primary hover:text-primary-hover">
            Privacy Policy
          </Link>
          , which explains how we collect, use and protect personal information.
        </p>
      }
      footerNote={
        <p className="text-center text-sm text-muted-foreground">
          FoodVault does not currently use marketing cookies for advertising purposes.
        </p>
      }
    >
      <LegalSection id="what-are-cookies" number="01" title="What Are Cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website.
        </p>
        <p>Cookies help websites:</p>
        <ul className="list-disc space-y-2 pl-5">
          {cookiePurposes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Cookies may be placed by FoodVault (&ldquo;first-party cookies&rdquo;) or by
          trusted third-party service providers (&ldquo;third-party cookies&rdquo;).
        </p>
      </LegalSection>

      <LegalSection id="why-we-use" number="02" title="Why FoodVault Uses Cookies">
        <p>FoodVault uses cookies and similar technologies to:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {whyFoodVaultUsesCookies.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-primary/10 bg-primary/5 p-4 sm:p-5"
            >
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="types" number="03" title="Types of Cookies We Use">
        <div className="space-y-4">
          {cookieTypes.map((type) => (
            <div
              key={type.title}
              className={`rounded-lg border border-border border-l-4 bg-background p-5 shadow-sm sm:p-6 ${type.borderClass}`}
            >
              <h3 className="font-bold text-foreground">{type.title}</h3>
              <p className="mt-2">{type.intro}</p>
              {type.supportLabel && type.points && (
                <>
                  <p className="mt-3">{type.supportLabel}</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {type.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
              {type.note && <p className="mt-3">{type.note}</p>}
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="third-party" number="04" title="Third-Party Services">
        <p>
          FoodVault may use trusted third-party services that may set cookies or similar
          technologies.
        </p>
        <p>These services may include:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <h3 className="font-semibold text-foreground">Payment Processing</h3>
            <p className="mt-2">
              Stripe may use cookies and similar technologies when processing
              subscription payments through its secure checkout services.
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <h3 className="font-semibold text-foreground">
              Platform Infrastructure and Security
            </h3>
            <p className="mt-2">
              Our technology providers may use cookies or similar technologies necessary
              to operate, secure and maintain the Platform.
            </p>
          </div>
        </div>
        <p>
          Third-party providers operate under their own privacy policies and terms.
          FoodVault does not control how third parties use their technologies.
        </p>
      </LegalSection>

      <LegalSection id="managing" number="05" title="Managing Cookies">
        <p>
          You can control or delete cookies through your browser settings.
        </p>
        <p>Most browsers allow you to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {browserControls.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Please note that disabling essential cookies may affect your ability to log in
          or use certain FoodVault features.
        </p>
      </LegalSection>

      <LegalSection id="consent-changes" number="06" title="Consent and Changes to This Policy">
        <p>
          Essential cookies are necessary for the operation and security of FoodVault.
        </p>
        <p>
          Where required by applicable law, FoodVault will request consent before using
          optional cookies.
        </p>
        <p>We may update this Cookie Policy from time to time.</p>
        <p>
          Any changes will be published on this page with an updated &ldquo;Last
          Updated&rdquo; date.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="07" title="Contact Us">
        <div className="rounded-lg bg-primary p-6 text-center text-white sm:p-10">
          <h3 className="text-xl font-bold sm:text-2xl">FoodVault is operated by</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:text-base">
            Britomart Groceries Limited
            <br />
            Trading as FoodVault
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/80 sm:text-base">
            For questions about cookies or privacy:
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
