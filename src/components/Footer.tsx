import Link from "next/link";
import { FoodVaultLogo } from "@/components/FoodVaultLogo";

const footerSections = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About FoodVault" },
      { href: "/for-brands", label: "Partner With Us" },
      { href: "/affiliate-program", label: "Affiliate Program" },
      { href: "/partners", label: "Our Partners" },
      { href: "/discover", label: "Discover" },
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

const socialLinks = [
  { href: "https://www.instagram.com/foodvault_nz/", label: "Instagram" },
  { href: "https://linkedin.com", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
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
              FoodVault is a membership platform connecting consumers with New Zealand
              food, beverage and household brands. Members pay a monthly subscription to
              access exclusive discounts and offers, then purchase directly from partner
              businesses.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 text-center sm:flex-row sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start sm:gap-5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
                aria-label={social.label}
              >
                {social.label}
              </a>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; FoodVault {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
