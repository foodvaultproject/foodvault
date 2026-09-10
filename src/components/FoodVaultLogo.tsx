import Image from "next/image";

const LOGO_SRC = "/foodvault-logo.png";
const LOGO_MENU_SRC = "/foodvault-logo-menu.png";
const VAULT_MARKET_LOGO_SRC = "/vaultmarket/vault-market-logo.webp";
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 256;
const VAULT_MARKET_LOGO_WIDTH = 720;
const VAULT_MARKET_LOGO_HEIGHT = 169;

type FoodVaultLogoSize = "nav" | "footer";
type FoodVaultLogoVariant = "default" | "menu" | "vault-market";

const SIZE_CLASSES: Record<FoodVaultLogoSize, string> = {
  nav: "h-[1.65rem] w-auto sm:h-[1.8rem]",
  footer: "h-[1.8rem] w-auto",
};

/** Menu nav logo: 30% larger than standard nav sizing. */
const MENU_SIZE_CLASSES = "h-[2.145rem] w-auto sm:h-[2.34rem]";

const VAULT_MARKET_SIZE_CLASSES: Record<FoodVaultLogoSize, string> = {
  nav: "h-8 w-auto max-w-[9.5rem] sm:h-10 sm:max-w-[13rem]",
  footer: "h-10 w-auto max-w-[12rem] sm:h-12 sm:max-w-[16rem]",
};

type FoodVaultLogoProps = {
  size?: FoodVaultLogoSize;
  variant?: FoodVaultLogoVariant;
  className?: string;
  priority?: boolean;
};

export function FoodVaultLogo({
  size = "nav",
  variant = "default",
  className = "",
  priority = false,
}: FoodVaultLogoProps) {
  const src = variant === "menu" ? LOGO_MENU_SRC : LOGO_SRC;
  const sizeClass = variant === "menu" ? MENU_SIZE_CLASSES : SIZE_CLASSES[size];

  if (variant === "vault-market") {
    return (
      <Image
        src={VAULT_MARKET_LOGO_SRC}
        alt="Vault Market"
        width={VAULT_MARKET_LOGO_WIDTH}
        height={VAULT_MARKET_LOGO_HEIGHT}
        sizes={size === "footer" ? "192px" : "152px"}
        className={`block shrink-0 object-contain object-left${className ? ` ${className}` : ""} ${VAULT_MARKET_SIZE_CLASSES[size]}`}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt="FoodVault"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      sizes={size === "nav" ? "180px" : "140px"}
      className={`shrink-0 object-contain object-left${className ? ` ${className}` : ""} ${sizeClass}`}
      priority={priority}
    />
  );
}
