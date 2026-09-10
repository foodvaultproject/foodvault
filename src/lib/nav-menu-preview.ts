/** Branded navigation and footer styling (purple nav + footer banner). */
export const NAV_MENU_PREVIEW_ENABLED = true;

/** Main nav background — brand primary purple (#8B7CF6). */
export const NAV_MENU_PREVIEW_GRADIENT = "bg-[#8B7CF6]";

/** Vault Market pages only — green chrome instead of FoodVault purple. */
export const VAULT_MARKET_CHROME_BG = "bg-[#10B981]";
export const VAULT_MARKET_FOOTER_BG = "bg-black";

export const NAV_MENU_CTA_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-sm border border-white bg-transparent px-3 py-2 text-xs font-semibold text-white transition-[transform,background-color,border-color] duration-150 hover:-translate-y-0.5 hover:bg-white/10 sm:px-4 sm:text-sm md:px-5";

export const NAV_MENU_CTA_BLOCK_CLASS =
  "block rounded-sm border border-white bg-transparent px-4 py-3 text-center text-base font-semibold text-white transition-[transform,background-color,border-color] duration-150 hover:bg-white/10";

export function navChromeBgClass(vaultMarket: boolean, menuPreview: boolean): string {
  if (vaultMarket) return VAULT_MARKET_CHROME_BG;
  if (menuPreview) return NAV_MENU_PREVIEW_GRADIENT;
  return "bg-white";
}
