import Link from "next/link";
import {
  LegalDocShell,
  LegalSection,
} from "@/components/legal/LegalDocShell";

const navItems = [
  { id: "what-are-cookies", label: "What Are Cookies?" },
  { id: "why-we-use", label: "Why FoodVault Uses Cookies" },
  { id: "types", label: "Types of Cookies We Use" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "managing", label: "Managing Cookies" },
  { id: "consent-changes", label: "Consent and Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

const cookiePurposes = [
  "remember user preferences and saved venues",
  "keep members signed in securely across devices",
  "maintain platform security and anti-fraud checks",
  "render live digital membership passes for in-store counter redemptions",
  "understand how visitors use the Platform to improve performance",
];

const whyFoodVaultUsesCookies = [
  {
    title: "Keep You Signed In",
    description:
      "Maintain secure login sessions so members can access their account, unlock online promo codes, or open their live pass on their mobile browser.",
  },
  {
    title: "Support In-Store Pass Verification",
    description:
      "Help render dynamic membership verification features (such as live counting clocks) when presenting your phone at local hospitality counters.",
  },
  {
    title: "Maintain Security & Anti-Fraud",
    description:
      "Protect user accounts, prevent screenshot abuse, detect suspicious login attempts, and uphold Platform integrity.",
  },
  {
    title: "Remember Preferences",
    description:
      "Store bookmarked online brands, favourite local cafes, and search filters across visits.",
  },
  {
    title: "Improve Platform Performance",
    description:
      "Track usage patterns, detect broken links or technical errors, and optimize local venue search rendering.",
  },
  {
    title: "Support Subscriptions",
    description:
      "Interface securely with payment gateways for monthly billing and membership verification.",
  },
];

const essentialCookieSupport = [
  "account authentication and secure sessions",
  "rendering active digital membership passes on mobile devices",
  "security, bot protection, and fraud prevention",
  "core Platform navigation and venue discovery",
];

const functionalCookieSupport = [
  "saved preferences and location settings",
  "favourite brands and bookmarked local venues",
  "personalized interface elements",
];

const analyticsInformation = [
  "pages and venue profiles visited",
  "usage patterns and search queries",
  "site speed and technical performance metrics",
];

const browserControls = [
  "block third-party cookies",
  "clear existing cookies and site storage",
  "receive alerts when cookies are placed on your device",
];

const cookieTypes = [
  {
    title: "Essential Cookies & Local Storage",
    borderClass: "border-l-primary",
    intro: "These technologies are strictly required for the Platform to function properly.",
    supportLabel: "They support:",
    points: essentialCookieSupport,
    note: "Disabling essential cookies or session storage will prevent you from signing in or displaying your live membership pass at physical venues.",
  },
  {
    title: "Functional Cookies",
    borderClass: "border-l-success",
    intro: "These cookies help customize your experience and remember your choices.",
    supportLabel: "They support:",
    points: functionalCookieSupport,
  },
  {
    title: "Analytics Cookies",
    borderClass: "border-l-teal-500",
    intro:
      "Where enabled, performance and analytics cookies help us understand how members interact with the Platform.",
    supportLabel: "This information includes:",
    points: analyticsInformation,
    note: "Analytics data is aggregated to help us improve FoodVault for members and business partners; it is not used to track individual purchase histories at local venues.",
  },
  {
    title: "Marketing Cookies",
    borderClass: "border-l-red-500",
    intro:
      "FoodVault does not currently use marketing or targeted advertising cookies.",
    note: "If this changes in the future, this policy will be updated and explicit consent will be requested where required by law.",
  },
];

export function CookieContent() {
  return (
    <LegalDocShell
      title="Cookie Policy"
      lastUpdated="August 2026"
      intro={
        <>
          This Cookie Policy explains how Britomart Groceries Limited, trading as
          FoodVault (&ldquo;FoodVault&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
          &ldquo;us&rdquo;), uses cookies, session storage, and similar technologies when
          you visit the FoodVault website, membership platform, digital pass system, and
          related services (&ldquo;Platform&rdquo;).
        </>
      }
      sidebarTitle="On This Page"
      navItems={navItems}
      heroExtra={
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          This policy should be read together with our{" "}
          <Link href="/privacy" className="font-semibold text-primary hover:text-primary-hover">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="font-semibold text-primary hover:text-primary-hover">
            Terms &amp; Conditions
          </Link>
          , which explain how we collect, use, and protect personal information.
        </p>
      }
      footerNote={
        <p className="text-center text-sm text-muted-foreground">
          FoodVault does not currently use marketing or targeted advertising cookies.
        </p>
      }
    >
      <LegalSection id="what-are-cookies" number="01" title="What Are Cookies?">
        <p>
          Cookies and local storage are small text files or data fragments stored on your
          computer or mobile device when you visit a website.
        </p>
        <p>Cookies help websites:</p>
        <ul className="list-disc space-y-2 pl-5">
          {cookiePurposes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Cookies may be placed directly by FoodVault (&ldquo;first-party cookies&rdquo;)
          or by trusted third-party technology providers (&ldquo;third-party
          cookies&rdquo;).
        </p>
      </LegalSection>

      <LegalSection id="why-we-use" number="02" title="Why FoodVault Uses Cookies">
        <p>FoodVault uses cookies and local storage technologies to:</p>
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
          FoodVault relies on trusted third-party providers that may set cookies or use
          similar storage technologies to support our operations. These include:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <h3 className="font-semibold text-foreground">Payment Processing</h3>
            <p className="mt-2">
              Stripe uses secure cookies and storage to manage billing portals, card
              verifications, and subscription processing.
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <h3 className="font-semibold text-foreground">
              Platform Security &amp; Infrastructure
            </h3>
            <p className="mt-2">
              Cloud infrastructure, mapping, and security providers (such as Cloudflare)
              use essential cookies to block malicious bots, deliver content quickly, and
              protect user sessions.
            </p>
          </div>
        </div>
        <p>
          Third-party providers operate under their own privacy and cookie policies.
          FoodVault does not control third-party tracking technologies.
        </p>
      </LegalSection>

      <LegalSection id="managing" number="05" title="Managing Cookies">
        <p>
          You can control, block, or delete cookies at any time through your web or mobile
          browser settings.
        </p>
        <p>Most browsers allow you to:</p>
        <ul className="list-disc space-y-2 pl-5">
          {browserControls.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Please note: Clearing or disabling essential cookies on your mobile browser will
          log you out and prevent you from loading your live digital membership pass when
          visiting participating hospitality venues.
        </p>
      </LegalSection>

      <LegalSection id="consent-changes" number="06" title="Consent and Changes to This Policy">
        <p>
          Essential cookies are automatically applied because they are necessary to deliver
          secure membership access and pass verification.
        </p>
        <p>
          Where required by applicable privacy laws, FoodVault will request consent before
          placing optional performance or functional cookies.
        </p>
        <p>
          We may update this Cookie Policy from time to time to reflect platform updates or
          legal requirements.
        </p>
        <p>
          Updated versions will be published on this page with a revised &ldquo;Last
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
            For questions about our Cookie Policy or data practices:
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
