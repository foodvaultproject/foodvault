import { formatMultibuyBadge } from "@/lib/commerce/catalog";
import type { FoodVaultProduct } from "@/types/commerce";

const badgeClass =
  "inline-flex items-center rounded-sm bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#78350F] shadow-sm ring-1 ring-[#B45309]/40";

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
