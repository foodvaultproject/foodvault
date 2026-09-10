import Image from "next/image";

const LOGO_SRC = "/foodvault-logo.png";
const LOGO_MENU_SRC = "/foodvault-logo-menu.png";
const VAULT_MARKET_LOGO_SRC = "/vaultmarket/VaultMarket_LOGO.png";
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 256;

type FoodVaultLogoSize = "nav" | "footer";
type FoodVaultLogoVariant = "default" | "menu" | "vault-market";

const SIZE_CLASSES: Record<FoodVaultLogoSize, string> = {
  nav: "h-[1.65rem] w-auto sm:h-[1.8rem]",
  footer: "h-[1.8rem] w-auto",
};

/** Menu nav logo: 30% larger than standard nav sizing. */
const MENU_SIZE_CLASSES = "h-[2.145rem] w-auto sm:h-[2.34rem]";

const VAULT_MARKET_CROP: Record<FoodVaultLogoSize, string> = {
  nav: "h-11 w-[13.2rem] sm:h-[3.025rem] sm:w-[15.4rem]",
  footer: "h-12 w-[14.4rem] sm:h-[3.3rem] sm:w-[16.8rem]",
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
      <span className={`relative block overflow-hidden ${VAULT_MARKET_CROP[size]}${className ? ` ${className}` : ""}`}>
        <Image
          src={VAULT_MARKET_LOGO_SRC}
          alt="Vault Market"
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          sizes="224px"
          className="absolute left-1/2 top-[48%] h-[230%] w-[230%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain mix-blend-screen"
          priority={priority}
          unoptimized
        />
      </span>
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
      unoptimized
    />
  );
}

