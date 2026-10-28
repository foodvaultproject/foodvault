import Link from "next/link";
import Image from "next/image";
import { FoodVaultLogo } from "@/components/FoodVaultLogo";
import { StockUpLogo } from "@/components/StockUpLogo";
import { STOCKUP_ORIGIN, getAppMode } from "@/lib/app-mode";
import { NAV_MENU_PREVIEW_ENABLED, VAULT_MARKET_FOOTER_BG, navChromeBgClass } from "@/lib/nav-menu-preview";

const FOOTER_BANNER = "/footer/footer-banner.png";

type FooterLink = { href: string; label: string; external?: boolean };

const stockupFooterSections: { title: string; links: FooterLink[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/", label: "Shop Supermarket" },
      { href: "/?categories=1", label: "Categories" },
      { href: "/?deals=1", label: "Deals" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

const foodvaultFooterSections: { title: string; links: FooterLink[] }[] = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About FoodVault" },
      { href: "/for-brands", label: "Partner With Us" },
      { href: "/", label: "Partner Brands" },
      { href: STOCKUP_ORIGIN, label: "Shop Supermarket", external: true },
      { href: "/discover", label: "News" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

const footerSections = getAppMode() === "stockup" ? stockupFooterSections : foodvaultFooterSections;

const sharedFooterSections: { title: string; links: FooterLink[] }[] = [
  {
    title: "Help & Support",
    links: [
      { href: "/faq", label: "FAQs" },
      { href: "/contact", label: "Support" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Use" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
];

const FOODVAULT_FOOTER_DESCRIPTION =
  "Unlock exclusive member discounts from Kiwi brands and local hospitality venues all over New Zealand. Save on the things you love, discover new favourites, and support local cafes, restaurants, and online stores direct.";

const STOCKUP_FOOTER_DESCRIPTION =
  "Direct supermarket delivery across New Zealand. Saver prices on everyday groceries, packed and shipped from our warehouse.";

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

function FooterAnchor({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function FooterLinkColumns({ menuPreview }: { menuPreview: boolean }) {
  const stockup = getAppMode() === "stockup";
  const sections = stockup
    ? [...footerSections, ...sharedFooterSections.filter((section) => section.title !== "Help & Support")]
    : [...footerSections, ...sharedFooterSections];
  return (
    <>
      {sections.map((section) => (
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
                <FooterAnchor
                  href={link.href}
                  external={link.external}
                  className={`text-sm transition-colors ${
                    menuPreview
                      ? "text-white hover:text-white/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </FooterAnchor>
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
        {socialLinks
          .filter((social) => getAppMode() !== "stockup" || social.label !== "Facebook")
          .map((social) => (
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
        &copy; {getAppMode() === "stockup" ? "StockUp" : "FoodVault"} {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
}

export function Footer({
  mobileBottomNavInset = false,
}: {
  mobileBottomNavInset?: boolean;
  vaultMarket?: boolean;
}) {
  const stockup = getAppMode() === "stockup";
  const menuPreview = !stockup && NAV_MENU_PREVIEW_ENABLED;
  const branded = menuPreview || stockup;
  const chromeBg = stockup ? VAULT_MARKET_FOOTER_BG : navChromeBgClass(false, menuPreview);
  const description = stockup ? STOCKUP_FOOTER_DESCRIPTION : FOODVAULT_FOOTER_DESCRIPTION;

  return (
    <footer
      className={
        branded
          ? `relative overflow-hidden border-t border-white/15 ${chromeBg}`
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
          branded ? "py-5" : "py-7"
        }`}
      >
        {branded ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:gap-x-6 lg:gap-y-5">
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <Link
                href="/"
                className="inline-block transition-opacity hover:opacity-80"
                aria-label={stockup ? "StockUp home" : "FoodVault home"}
              >
                {stockup ? (
                  <StockUpLogo size="footer" />
                ) : (
                  <FoodVaultLogo size="footer" variant={menuPreview ? "menu" : "default"} />
                )}
              </Link>
              <p className="text-sm leading-relaxed text-white">{description}</p>
            </div>
            <FooterLinkColumns menuPreview />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link
                href="/"
                className="inline-block transition-opacity hover:opacity-80"
                aria-label={stockup ? "StockUp home" : "FoodVault home"}
              >
                {stockup ? <StockUpLogo size="footer" /> : <FoodVaultLogo size="footer" />}
              </Link>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <FooterLinkColumns menuPreview={false} />
          </div>
        )}

        <FooterBottomBar
          menuPreview={branded}
          mobileBottomNavInset={mobileBottomNavInset}
        />
      </div>
    </footer>
  );
}
