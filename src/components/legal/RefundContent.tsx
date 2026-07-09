import Link from "next/link";
import {
  LegalDocShell,
  LegalSection,
} from "@/components/legal/LegalDocShell";

const navItems = [
  { id: "memberships-only", label: "1. Memberships Only" },
  { id: "partner-purchases", label: "2. Partner Purchases" },
  { id: "subscription", label: "3. Membership Subscription" },
  { id: "free-trial", label: "4. Free Trial" },
  { id: "cancellation", label: "5. Cancelling Your Membership" },
  { id: "refunds", label: "6. Membership Refund Policy" },
  { id: "failed-payments", label: "7. Failed Payments" },
  { id: "termination", label: "8. Membership Suspension or Termination" },
  { id: "payment-disputes", label: "9. Payment Disputes" },
  { id: "changes", label: "10. Changes to This Policy" },
  { id: "contact", label: "11. Contact Us" },
];

const foodVaultDoesNot = [
  "sell physical products",
  "process retail purchases",
  "fulfil customer orders",
  "provide delivery services",
  "manage returns or refunds for products purchased from partner businesses",
];

const partnerPurchaseTopics = [
  "payments",
  "delivery",
  "product quality",
  "returns",
  "refunds",
  "order issues",
];

const accountManagement = [
  "viewing membership status",
  "updating payment details",
  "managing cancellation",
];

const cancelSteps = [
  "Log in to your FoodVault account.",
  "Navigate to your membership settings.",
  "Select cancellation and follow the confirmation process.",
];

const nonRefundableCircumstances = [
  "you have not used your membership",
  "you forgot to cancel before renewal",
  "you no longer wish to use the Platform",
  "you do not find suitable partner offers",
  "you do not use available membership benefits",
];

const failedPaymentActions = [
  "retry the payment",
  "notify you of the failed payment",
  "restrict membership access until payment is resolved",
];

const terminationReasons = [
  "these Terms or policies are breached",
  "fraudulent activity is suspected",
  "the Platform is misused",
  "member-only benefits are abused",
  "activity may harm FoodVault, members or partner businesses",
];

export function RefundContent() {
  return (
    <LegalDocShell
      title="Refund & Cancellation Policy"
      lastUpdated="July 2026"
      intro={
        <>
          This Refund &amp; Cancellation Policy explains how membership cancellations,
          subscription payments and refund requests are managed by FoodVault.
        </>
      }
      sidebarSubtitle="Legal & Compliance"
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
              </p>
              <p>
                This policy applies to FoodVault membership subscriptions only.
              </p>
            </div>
          </div>
        </div>
      }
      footerNote={
        <div className="relative overflow-hidden rounded-lg bg-primary px-6 py-10 text-center text-white sm:px-10 sm:py-12">
          <svg
            className="pointer-events-none absolute right-4 top-1/2 h-32 w-32 -translate-y-1/2 text-white/10 sm:right-10 sm:h-40 sm:w-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl">Important Reminder</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              FoodVault manages your membership subscription only. Any purchases made
              directly with partner businesses are separate transactions and are governed
              by the individual partner&apos;s own refund, return and cancellation policies.
            </p>
          </div>
        </div>
      }
    >
      <LegalSection id="memberships-only" number="01" title="Memberships Only">
        <p>
          FoodVault is a membership platform that provides access to member benefits,
          including exclusive offers and discounts from participating partner businesses.
        </p>
        <p>FoodVault does not:</p>
        <ul className="list-disc space-y-2 pl-5">
          {foodVaultDoesNot.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Your FoodVault membership fee provides access to the Platform and membership
          benefits only.
        </p>
      </LegalSection>

      <LegalSection id="partner-purchases" number="02" title="Partner Purchases">
        <p>
          FoodVault does not sell products on behalf of partner businesses.
        </p>
        <p>
          When you purchase products from a partner business, you enter into a separate
          transaction directly with that business.
        </p>
        <p>Any questions relating to partner purchases, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          {partnerPurchaseTopics.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>must be directed to the relevant partner business.</p>
        <p>
          Partner purchases are subject to the partner&apos;s own Terms, Privacy Policy
          and refund policies.
        </p>
      </LegalSection>

      <LegalSection id="subscription" number="03" title="Membership Subscription">
        <p>FoodVault membership is provided as a recurring subscription.</p>
        <p>
          The applicable membership price is displayed during signup before payment
          confirmation.
        </p>
        <p>
          By subscribing, you authorise FoodVault to charge your nominated payment method
          at each billing cycle until your membership is cancelled.
        </p>
        <p>Your account allows you to manage your subscription, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          {accountManagement.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Payments are securely processed through Stripe.</p>
        <p>FoodVault does not store complete payment card details.</p>
      </LegalSection>

      <LegalSection id="free-trial" number="04" title="Free Trial">
        <p>FoodVault may offer eligible new members a free trial.</p>
        <p>
          The duration and terms of any free trial will be displayed during signup.
        </p>
        <p>
          Unless cancelled before the trial period expires, your membership will
          automatically convert into a paid subscription and your nominated payment method
          will be charged.
        </p>
        <p>
          By starting a free trial, you acknowledge and accept this automatic conversion
          process.
        </p>
        <p>
          Members are responsible for cancelling before the trial expiry date if they do
          not wish to continue with a paid membership.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" number="05" title="Cancelling Your Membership">
        <p>You may cancel your FoodVault membership at any time.</p>
        <p>To cancel:</p>
        <ol className="list-decimal space-y-3 pl-5">
          {cancelSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>Cancellation prevents future subscription charges.</p>
        <p>
          Your membership will remain active until the end of your current paid billing
          period.
        </p>
        <p>
          Cancelling your membership does not provide a refund for unused time remaining
          in that billing period unless required by law.
        </p>
      </LegalSection>

      <LegalSection id="refunds" number="06" title="Membership Refund Policy">
        <p>
          Membership fees are generally non-refundable once a billing period has
          commenced.
        </p>
        <p>This includes circumstances where:</p>
        <ul className="list-disc space-y-2 pl-5">
          {nonRefundableCircumstances.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Refunds may be provided where:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
            <h3 className="font-bold text-foreground">Technical Issues</h3>
            <p className="mt-2">
              FoodVault may provide a refund or account adjustment where a significant
              Platform issue prevents access to core membership features for an extended
              period and the issue is caused by FoodVault.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
            <h3 className="font-bold text-foreground">Legal Requirements</h3>
            <p className="mt-2">
              FoodVault will provide refunds where required under applicable New Zealand
              law, including obligations under the Consumer Guarantees Act 1993 where
              applicable.
            </p>
          </div>
        </div>
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
      </LegalSection>

      <LegalSection id="failed-payments" number="07" title="Failed Payments">
        <p>If a membership payment fails, FoodVault may:</p>
        <ul className="list-disc space-y-2 pl-5">
          {failedPaymentActions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          If payment remains unsuccessful, FoodVault may suspend or cancel your
          membership.
        </p>
      </LegalSection>

      <LegalSection id="termination" number="08" title="Membership Suspension or Termination">
        <p>FoodVault may suspend or terminate membership access where:</p>
        <ul className="list-disc space-y-2 pl-5">
          {terminationReasons.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Where termination occurs due to misuse or breach, refunds are not guaranteed
          except where required by law.
        </p>
      </LegalSection>

      <LegalSection id="payment-disputes" number="09" title="Payment Disputes">
        <p>
          If you believe there is an issue with a FoodVault membership charge, please
          contact FoodVault first so we can investigate and attempt to resolve the
          matter.
        </p>
        <p>
          Submitting a payment dispute or chargeback without first contacting FoodVault
          may delay resolution.
        </p>
        <p>
          Nothing in this policy limits any rights available to you under applicable New
          Zealand law.
        </p>
      </LegalSection>

      <LegalSection id="changes" number="10" title="Changes to This Policy">
        <p>
          FoodVault may update this Refund &amp; Cancellation Policy from time to time.
        </p>
        <p>
          Material changes will be published on the Platform with an updated &ldquo;Last
          Updated&rdquo; date.
        </p>
        <p>
          Continued use of FoodVault after changes take effect constitutes acceptance of
          the updated policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="11" title="Contact Us">
        <div className="rounded-lg bg-primary p-6 text-center text-white sm:p-10">
          <p className="text-sm text-white/80 sm:text-base">
            For questions relating to membership billing, cancellations or refund
            requests:
          </p>
          <h3 className="mt-4 text-xl font-bold sm:text-2xl">FoodVault</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:text-base">
            Operated by:
            <br />
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
