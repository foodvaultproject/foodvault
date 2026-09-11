import { formatMultibuyBadge } from "@/lib/commerce/catalog";
import type { FoodVaultProduct } from "@/types/commerce";

const badgeClass =
  "inline-flex items-center rounded-sm border border-[#ff751f] bg-[#ffe8d6] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#c44e00]";

export function MultibuyBadge({
  product,
  className = "",
}: {
  product: FoodVaultProduct;
  className?: string;
}) {
  const label = formatMultibuyBadge(product);
  if (!label) return null;
  return <span className={`${badgeClass} ${className}`.trim()}>{label}</span>;
}
