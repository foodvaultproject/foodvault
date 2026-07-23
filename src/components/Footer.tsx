import Link from "next/link";
import { FoodVaultLogo } from "@/components/FoodVaultLogo";
import { NAV_MENU_PREVIEW_ENABLED } from "@/lib/nav-menu-preview";

const FOOTER_BANNER = "/footer/footer_banner.png";

const footerSections = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About FoodVault" },
      { href: "/for-brands", label: "Partner With Us" },
      { href: "/affiliate-program", label: "Affiliate Program" },
      { href: "/partners", label: "Our Partners" },
      { href: "/discover", label: "What's Happening?" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Help & Support",
    links: [
      { href: "/faq", label: "FAQs" },
      { href: "/contact", label: "Member Support" },
      { href: "/contact", label: "Partner Support" },
      { href: "/how-it-works", label: "How It Works" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Use" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/refund-policy", label: "Refund Policy" },
      { href: "/affiliate-terms", label: "Affiliate Terms" },
    ],
  },
];

const FOOTER_DESCRIPTION =
  "FoodVault is a membership platform connecting consumers with New Zealand food, beverage and household brands. Members pay a monthly subscription to access exclusive discounts and offers, then purchase directly from partner businesses.";

const socialLinks = [
  {
    href: "https://www.instagram.com/foodvault_nz/",
    label: "Instagram",
    iconPath:
      "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.8-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z",
  },
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    iconPath:
      "M4.98 3.5a2.25 2.25 0 1 1-.02 4.5 2.25 2.25 0 0 1 .02-4.5zM3.5 8.75h2.9V21H3.5V8.75zM12 8.75h2.78v1.67h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.47V21H18.1v-6.88c0-1.64-.03-3.75-2.29-3.75-2.29 0-2.64 1.79-2.64 3.63V21h-2.9V8.75z",
  },
];

function FooterLinkColumns({ menuPreview }: { menuPreview: boolean }) {
  return (
    <>
      {footerSections.map((section) => (
        <div key={section.title}>
          <h3
            className={`text-sm font-semibold ${
              menuPreview ? "text-white" : "text-foreground"
            }`}
          >
            {section.title}
          </h3>
          <ul className={menuPreview ? "mt-2.5 space-y-2" : "mt-4 space-y-3"}>
            {section.links.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className={`text-sm transition-colors ${
                    menuPreview
                      ? "text-white hover:text-white/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function FooterBottomBar({ menuPreview }: { menuPreview: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 border-t text-center sm:flex-row sm:text-left ${
        menuPreview
          ? "mt-6 border-white/15 pt-5"
          : "mt-12 gap-6 border-border pt-8"
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              menuPreview
                ? "inline-flex h-8 w-8 items-center justify-center text-white transition-opacity hover:opacity-80"
                : "text-sm text-muted-foreground transition-colors hover:text-primary"
            }
            aria-label={social.label}
          >
            {menuPreview ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d={social.iconPath} />
              </svg>
            ) : (
              social.label
            )}
          </a>
        ))}
      </div>
      <p
        className={`text-sm ${
          menuPreview ? "text-white" : "text-muted-foreground"
        }`}
      >
        &copy; FoodVault {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
}

export function Footer() {
  const menuPreview = NAV_MENU_PREVIEW_ENABLED;

  return (
    <footer
      className={
        menuPreview
          ? "relative overflow-hidden border-t border-white/15 bg-primary"
          : "border-t border-border bg-background"
      }
    >
      {menuPreview ? (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-bottom bg-no-repeat"
          style={{ backgroundImage: `url('${FOOTER_BANNER}')` }}
          aria-hidden="true"
        />
      ) : null}
      <div
        className={`relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 ${
          menuPreview ? "py-5" : "py-7"
        }`}
      >
        {menuPreview ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:gap-x-6 lg:gap-y-5">
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <Link
                href="/"
                className="inline-block transition-opacity hover:opacity-80"
                aria-label="FoodVault home"
              >
                <FoodVaultLogo size="nav" variant="menu" />
              </Link>
              <p className="text-sm leading-relaxed text-white">
                  {FOOTER_DESCRIPTION}
                </p>
            </div>
            <FooterLinkColumns menuPreview />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link
                href="/"
                className="inline-block transition-opacity hover:opacity-80"
                aria-label="FoodVault home"
              >
                <FoodVaultLogo size="footer" />
              </Link>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {FOOTER_DESCRIPTION}
              </p>
            </div>
            <FooterLinkColumns menuPreview={false} />
          </div>
        )}

        <FooterBottomBar menuPreview={menuPreview} />
      </div>
    </footer>
  );
}
