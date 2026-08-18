import Link from "next/link";
import Image from "next/image";
import { FoodVaultLogo } from "@/components/FoodVaultLogo";
import { NAV_MENU_PREVIEW_ENABLED } from "@/lib/nav-menu-preview";

const FOOTER_BANNER = "/footer/footer-banner.png";

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
  "Unlock exclusive member discounts from Kiwi brands and local hospitality venues all over New Zealand. Save on the things you love, discover new favourites, and support local cafes, restaurants, and online stores direct.";

const socialLinks = [
  {
    href: "https://www.instagram.com/foodvault_nz/",
    label: "Instagram",
    iconSrc: "/footer/instagram.png",
  },
  {
    href: "https://www.facebook.com/foodvaultnz",
    label: "Facebook",
    iconSrc: "/footer/facebook.png",
  },
  {
    href: "https://www.linkedin.com/company/foodvault-nz",
    label: "LinkedIn",
    iconSrc: "/footer/linkedin.png",
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

function FooterBottomBar({
  menuPreview,
  mobileBottomNavInset = false,
}: {
  menuPreview: boolean;
  mobileBottomNavInset?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 border-t text-center sm:flex-row sm:text-left ${
        menuPreview
          ? "mt-6 border-white/15 pt-5"
          : "mt-12 gap-6 border-border pt-8"
      } ${
        mobileBottomNavInset
          ? "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
          : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-12 items-center justify-center transition-opacity hover:opacity-80 sm:h-[60px] sm:w-[60px]"
            aria-label={social.label}
          >
            <Image
              src={social.iconSrc}
              alt=""
              width={60}
              height={60}
              className="h-12 w-12 object-contain sm:h-[60px] sm:w-[60px]"
            />
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

export function Footer({
  mobileBottomNavInset = false,
}: {
  mobileBottomNavInset?: boolean;
}) {
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

        <FooterBottomBar
          menuPreview={menuPreview}
          mobileBottomNavInset={mobileBottomNavInset}
        />
      </div>
    </footer>
  );
}
