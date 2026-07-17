import Image from "next/image";

const LOGO_SRC = "/foodvault-logo.png";
const LOGO_MENU_SRC = "/foodvault-logo-menu.png";
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 256;

type FoodVaultLogoSize = "nav" | "footer";
type FoodVaultLogoVariant = "default" | "menu";

const SIZE_CLASSES: Record<FoodVaultLogoSize, string> = {
  nav: "h-[1.65rem] w-auto sm:h-[1.8rem]",
  footer: "h-[1.8rem] w-auto",
};

/** Menu nav logo: 30% larger than standard nav sizing. */
const MENU_SIZE_CLASSES = "h-[2.145rem] w-auto sm:h-[2.34rem]";

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
  const sizeClass =
    variant === "menu" ? MENU_SIZE_CLASSES : SIZE_CLASSES[size];

  return (
    <Image
      src={src}
      alt="FoodVault"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      sizes={size === "nav" ? "150px" : "115px"}
      className={`shrink-0 ${sizeClass}${className ? ` ${className}` : ""}`}
      priority={priority}
      unoptimized
    />
  );
}
