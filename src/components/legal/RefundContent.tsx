import Link from "next/link";
import {
  LegalDocShell,
  LegalSection,
} from "@/components/legal/LegalDocShell";

const navItems = [
  { id: "memberships-only", label: "Memberships Only" },
  { id: "partner-purchases", label: "Partner Purchases & Hospitality Visits" },
  { id: "subscription", label: "Membership Subscription" },
  { id: "member-access", label: "Member Access & Redemption" },
  { id: "cancellation", label: "Cancelling Your Membership" },
  { id: "refunds", label: "Membership Refund Policy" },
  { id: "failed-payments", label: "Failed Payments" },
  { id: "termination", label: "Membership Suspension or Termination" },
  { id: "payment-disputes", label: "Payment Disputes" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

const foodVaultDoesNot = [
  "sell physical products directly",
  "process retail checkout transactions",
  "operate hospitality venues, cafes, or restaurants",
  "fulfill customer orders or provide food delivery services",
  "manage returns, item replacements, or refunds for products or meals purchased from partner businesses",
];

const partnerPurchaseTopics = [
  "online order payments and shipping",
  "food quality, dietary/allergen requirements, or venue service",
  "product returns, exchanges, or meal refunds",
  "order or receipt issues",
];

const accountManagement = [
  "viewing membership status",
  "updating payment details",
  "managing subscription cancellation",
];

const cancelSteps = [
  "Log in to your FoodVault account.",
  "Navigate to your account settings / membership portal.",
  "Select cancellation and follow the confirmation prompt.",
];

const nonRefundableCircumstances = [
  "you have not used your membership during the month",
  "you forgot to cancel before the automatic renewal date",
  "you no longer wish to use the Platform",
  "you do not find partner offers or local venues in your immediate area that suit your preferences",
  "you failed to present your live membership pass at a venue counter prior to paying your bill",
];

const failedPaymentActions = [
  "re-attempt the transaction via Stripe",
  "notify you of the billing issue",
  "restrict access to online codes and live in-store passes until payment is resolved",
];

const terminationReasons = [
  "these Terms or Platform policies are breached",
  "fraudulent pass usage (such as sharing static screenshots or screen recordings at venues) is identified",
  "member account credentials are shared with non-members",
  "activity presents a security risk or potential harm to FoodVault, other members, or partner venues",
];

export function RefundContent() {
  return (
    <LegalDocShell
      title="Refund & Cancellation Policy"
      lastUpdated="August 2026"
      intro={
        <>
          This Refund &amp; Cancellation Policy explains how membership cancellations,
          subscription payments, and refund requests are managed by FoodVault.
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
              FoodVault manages your membership subscription only. Any purchases or
              transactions made directly with partner brands or local hospitality venues
              are separate transactions governed by the individual business&apos;s own
              refund, return, and cancellation policies.
            </p>
          </div>
        </div>
      }
    >
      <LegalSection id="memberships-only" number="01" title="Memberships Only">
        <p>
          FoodVault is a membership platform that provides access to member benefits,
          including exclusive online promo codes and live in-store discounts from
          participating partner businesses and local venues.
        </p>
        <p>FoodVault does not:</p>
        <ul className="list-disc space-y-2 pl-5">
          {foodVaultDoesNot.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Your FoodVault membership fee provides subscription access to the Platform and
          member benefits only.
        </p>
      </LegalSection>

      <LegalSection id="partner-purchases" number="02" title="Partner Purchases & Hospitality Visits">
        <p>
          FoodVault does not sell products or food items on behalf of partner businesses.
        </p>
        <p>
          <span className="font-semibold text-foreground">Online Purchases:</span> When you
          buy products from a partner brand&apos;s website, you enter into a separate
          commercial transaction directly with that business.
        </p>
        <p>
          <span className="font-semibold text-foreground">In-Store &amp; Dining Visits:</span>{" "}
          When you order food, drinks, or goods at a participating hospitality venue
          (cafe, restaurant, bakery, deli), all food preparation, service quality, and
          payment transactions occur directly between you and the venue.
        </p>
        <p>Any questions relating to partner transactions, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          {partnerPurchaseTopics.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          must be directed directly to the relevant partner business or venue. Partner
          transactions are governed by the individual partner&apos;s own Terms, Privacy
          Policy, and refund policies.
        </p>
      </LegalSection>

      <LegalSection id="subscription" number="03" title="Membership Subscription">
        <p>FoodVault membership is provided as a recurring monthly subscription.</p>
        <p>
          The applicable membership price is displayed during signup before payment
          confirmation.
        </p>
        <p>
          By subscribing, you authorise FoodVault to charge your nominated payment method
          at each billing cycle until your membership is cancelled.
        </p>
        <p>Your account allows you to manage your subscription at any time, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          {accountManagement.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Payments are securely processed through Stripe.</p>
        <p>FoodVault does not store complete payment card details.</p>
      </LegalSection>

      <LegalSection id="member-access" number="04" title="Member Access & Redemption">
        <p>
          You can browse all brand profiles and local venue listings on FoodVault without
          a paid membership.
        </p>
        <p>
          Unlocking online promo codes and accessing your live in-store digital membership
          pass requires an active paid membership purchased through Stripe Checkout.
        </p>
        <p>
          Access to member benefits begins immediately upon successful payment confirmation.
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
        <p>Cancellation prevents future recurring subscription charges.</p>
        <p>
          Your membership will remain active until the end of your current paid billing
          period, allowing you to continue using online codes and in-store passes until
          that period expires.
        </p>
        <p>
          Cancelling your membership does not entitle you to a refund for unused time
          remaining in that billing period unless required by law.
        </p>
      </LegalSection>

      <LegalSection id="refunds" number="06" title="Membership Refund Policy">
        <p>
          Membership fees are generally non-refundable once a billing cycle has commenced.
        </p>
        <p>This includes circumstances where:</p>
        <ul className="list-disc space-y-2 pl-5">
          {nonRefundableCircumstances.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="font-semibold text-foreground">Refund Exceptions:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
            <h3 className="font-bold text-foreground">Technical Issues</h3>
            <p className="mt-2">
              FoodVault may provide a refund or subscription credit where a significant
              Platform outage prevents access to core membership features (such as
              rendering live in-store passes or retrieving codes) for an extended period,
              and the fault lies solely with FoodVault.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
            <h3 className="font-bold text-foreground">Legal Requirements</h3>
            <p className="mt-2">
              FoodVault will provide refunds where required under applicable New Zealand
              legislation, including statutory obligations under the Consumer Guarantees
              Act 1993 and the Fair Trading Act 1986.
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
        <p>If a recurring membership payment fails, FoodVault may:</p>
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
          Where account termination occurs due to fraud or breach, subscription refunds
          will not be granted except where required by law.
        </p>
      </LegalSection>

      <LegalSection id="payment-disputes" number="09" title="Payment Disputes">
        <p>
          If you believe there is an error with a FoodVault membership charge, please
          contact FoodVault directly so we can investigate and resolve the issue quickly.
        </p>
        <p>
          Submitting a bank chargeback or payment dispute without contacting us first may
          result in temporary account suspension pending review.
        </p>
        <p>
          Nothing in this policy limits any non-excludable rights available to you under
          New Zealand law.
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
            For questions relating to membership billing, cancellations, or refund
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
