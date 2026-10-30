import Link from "next/link";
import { headers } from "next/headers";
import { getAppMode } from "@/lib/app-mode";
import { LegalDocShell, LegalSection } from "@/components/legal/LegalDocShell";

export async function isStockUpRequest() {
  const headerStore = await headers();
  return getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup";
}

const OPERATOR = "Britomart Groceries Limited";

function OperatorBlock() {
  return (
    <p>
      StockUp is operated by:
      <br />
      <span className="font-semibold text-foreground">
        {OPERATOR}
        <br />
        Trading as StockUp
      </span>
    </p>
  );
}

function ContactBlock() {
  return (
    <div className="space-y-3">
      <OperatorBlock />
      <p>
        Questions about these pages can be sent through the{" "}
        <Link href="/contact" className="font-semibold text-vm-primary">
          StockUp contact form
        </Link>
        .
      </p>
    </div>
  );
}

export function StockUpTermsContent() {
  return (
    <LegalDocShell
      stockup
      badge="StockUp"
      title="Terms of Use"
      lastUpdated="30 October 2026"
      intro="These terms cover shopping, accounts, and orders on StockUp."
      sidebarTitle="On this page"
      sidebarSubtitle="StockUp"
      navItems={[
        { id: "about", label: "About StockUp" },
        { id: "accounts", label: "Accounts" },
        { id: "orders", label: "Orders and prices" },
        { id: "delivery", label: "Delivery" },
        { id: "use", label: "Acceptable use" },
        { id: "law", label: "New Zealand law" },
        { id: "contact", label: "Contact" },
      ]}
    >
      <LegalSection stockup id="about" number="01" title="About StockUp">
        <OperatorBlock />
        <p>
          StockUp is an online grocery shop for customers in New Zealand. These terms
          apply when you browse the shop, create an account, or place an order.
        </p>
      </LegalSection>
      <LegalSection stockup id="accounts" number="02" title="Accounts">
        <p>
          You need accurate contact details to create an account. Keep your password
          private. You are responsible for orders placed from your account.
        </p>
        <p>You can close your account from the account page, or ask us to close it.</p>
      </LegalSection>
      <LegalSection stockup id="orders" number="03" title="Orders and prices">
        <p>
          Product prices, multibuy offers, and availability are shown on StockUp at the
          time you add an item. An order is accepted when you receive an order
          confirmation. If an item is unavailable after you order, we will not charge you
          for that item.
        </p>
        <p>
          Payments are taken through our payment provider. StockUp does not store your
          full card number.
        </p>
      </LegalSection>
      <LegalSection stockup id="delivery" number="04" title="Delivery">
        <p>
          Delivery options and any delivery fee are shown before you pay. Groceries are
          packed from our warehouse and sent to the address you provide.
        </p>
      </LegalSection>
      <LegalSection stockup id="use" number="05" title="Acceptable use">
        <p>
          Do not misuse the site, attempt to access another customer&apos;s account, or
          interfere with orders, pricing, or checkout. We may refuse or cancel an order
          that looks fraudulent or that we cannot fulfil.
        </p>
      </LegalSection>
      <LegalSection stockup id="law" number="06" title="New Zealand law">
        <p>
          These terms are governed by New Zealand law. Nothing in them limits rights you
          have under the Consumer Guarantees Act 1993 or the Fair Trading Act 1986.
        </p>
      </LegalSection>
      <LegalSection stockup id="contact" number="07" title="Contact">
        <ContactBlock />
      </LegalSection>
    </LegalDocShell>
  );
}

export function StockUpPrivacyContent() {
  return (
    <LegalDocShell
      stockup
      badge="StockUp"
      title="Privacy Policy"
      lastUpdated="30 October 2026"
      intro="This policy explains what StockUp collects when you shop for groceries, and how that information is used."
      sidebarTitle="On this page"
      sidebarSubtitle="StockUp"
      navItems={[
        { id: "who", label: "Who we are" },
        { id: "collect", label: "What we collect" },
        { id: "use", label: "How we use it" },
        { id: "sharing", label: "Who we share it with" },
        { id: "rights", label: "Your choices" },
        { id: "contact", label: "Contact" },
      ]}
    >
      <LegalSection stockup id="who" number="01" title="Who we are">
        <OperatorBlock />
        <p>
          We handle personal information under the Privacy Act 2020. StockUp does not sell
          your personal information.
        </p>
      </LegalSection>
      <LegalSection stockup id="collect" number="02" title="What we collect">
        <p>When you create an account or place an order, we collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Your name, email address, and password</li>
          <li>Delivery details and order contents</li>
          <li>Payment status from our payment provider</li>
          <li>Basic device and browser details needed to run the shop</li>
        </ul>
        <p>We do not store your full card number.</p>
      </LegalSection>
      <LegalSection stockup id="use" number="03" title="How we use it">
        <p>We use this information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and protect your account</li>
          <li>Pack, deliver, and support your grocery orders</li>
          <li>Send order and account emails you ask for</li>
          <li>Keep the shop secure and understand which pages are used</li>
        </ul>
      </LegalSection>
      <LegalSection stockup id="sharing" number="04" title="Who we share it with">
        <p>
          We share information only with services that run StockUp, such as payment
          processing, email delivery, and hosting. Those providers may store data outside
          New Zealand. We do not sell your details or use them for advertising.
        </p>
      </LegalSection>
      <LegalSection stockup id="rights" number="05" title="Your choices">
        <p>
          You can review and update your name and location on your account page, ask for a
          copy of the personal information we hold, ask us to correct it, or ask us to
          delete your account.
        </p>
      </LegalSection>
      <LegalSection stockup id="contact" number="06" title="Contact">
        <ContactBlock />
      </LegalSection>
    </LegalDocShell>
  );
}

export function StockUpCookieContent() {
  return (
    <LegalDocShell
      stockup
      badge="StockUp"
      title="Cookie Policy"
      lastUpdated="30 October 2026"
      intro="StockUp uses cookies and similar storage so you can stay signed in, keep a cart, and use the shop."
      sidebarTitle="On this page"
      sidebarSubtitle="StockUp"
      navItems={[
        { id: "what", label: "What cookies are" },
        { id: "why", label: "Why StockUp uses them" },
        { id: "types", label: "The cookies we use" },
        { id: "manage", label: "Managing cookies" },
        { id: "contact", label: "Contact" },
      ]}
    >
      <LegalSection stockup id="what" number="01" title="What cookies are">
        <p>
          Cookies are small text files stored by your browser. StockUp also uses local
          storage in your browser for the grocery list and cart on this device.
        </p>
      </LegalSection>
      <LegalSection stockup id="why" number="02" title="Why StockUp uses them">
        <ul className="list-disc space-y-2 pl-5">
          <li>Keep you signed in</li>
          <li>Remember the cart and grocery list on this browser</li>
          <li>Protect checkout and sign-in from automated abuse</li>
          <li>Measure which shop pages are used, in aggregate</li>
        </ul>
        <p>StockUp does not use cookies to build an advertising profile.</p>
      </LegalSection>
      <LegalSection stockup id="types" number="03" title="The cookies we use">
        <p>
          Essential cookies are required to sign in and check out. If you block them, the
          shop cannot keep you signed in. Analytics cookies, where used, help us see which
          pages are busy. They are not used to track grocery purchases for advertising.
        </p>
      </LegalSection>
      <LegalSection stockup id="manage" number="04" title="Managing cookies">
        <p>
          You can delete cookies in your browser settings. Doing that will sign you out and
          clear the cart stored in that browser.
        </p>
      </LegalSection>
      <LegalSection stockup id="contact" number="05" title="Contact">
        <ContactBlock />
      </LegalSection>
    </LegalDocShell>
  );
}

export function StockUpRefundContent() {
  return (
    <LegalDocShell
      stockup
      badge="StockUp"
      title="Refund Policy"
      lastUpdated="30 October 2026"
      intro="This policy covers grocery orders placed on StockUp."
      sidebarTitle="On this page"
      sidebarSubtitle="StockUp"
      navItems={[
        { id: "orders", label: "Grocery orders" },
        { id: "problems", label: "Missing or damaged items" },
        { id: "cancellations", label: "Cancellations" },
        { id: "rights", label: "Your consumer rights" },
        { id: "contact", label: "Contact" },
      ]}
    >
      <LegalSection stockup id="orders" number="01" title="Grocery orders">
        <OperatorBlock />
        <p>
          This policy applies to groceries you buy from StockUp.
        </p>
      </LegalSection>
      <LegalSection stockup id="problems" number="02" title="Missing or damaged items">
        <p>
          If an item is missing, damaged, or not as described, contact us with your order
          number. We will refund that item or replace it. Perishable groceries should be
          reported as soon as you receive the order.
        </p>
      </LegalSection>
      <LegalSection stockup id="cancellations" number="03" title="Cancellations">
        <p>
          You can ask us to cancel an order before it has been packed. Once an order is
          packed or handed to delivery, it can no longer be cancelled. Items we cannot
          supply are not charged.
        </p>
      </LegalSection>
      <LegalSection stockup id="rights" number="04" title="Your consumer rights">
        <p>
          Nothing in this policy limits your rights under the Consumer Guarantees Act 1993.
          Refunds are returned to the original payment method.
        </p>
      </LegalSection>
      <LegalSection stockup id="contact" number="05" title="Contact">
        <p>Include your order number when you write to us.</p>
        <ContactBlock />
      </LegalSection>
    </LegalDocShell>
  );
}
