import Image from "next/image";

const LOGO_SRC = "/foodvault-logo.png";
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 256;

type FoodVaultLogoSize = "nav" | "footer";

const SIZE_CLASSES: Record<FoodVaultLogoSize, string> = {
  nav: "h-[1.65rem] w-auto sm:h-[1.8rem]",
  footer: "h-[1.8rem] w-auto",
};

type FoodVaultLogoProps = {
  size?: FoodVaultLogoSize;
  className?: string;
  priority?: boolean;
};

export function FoodVaultLogo({
  size = "nav",
  className = "",
  priority = false,
}: FoodVaultLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="FoodVault"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      sizes={size === "nav" ? "115px" : "115px"}
      className={`shrink-0 ${SIZE_CLASSES[size]}${className ? ` ${className}` : ""}`}
      priority={priority}
      unoptimized
    />
  );
}
