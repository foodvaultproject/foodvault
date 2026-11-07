import { FREE_SHIPPING_THRESHOLD_NZD } from "@/lib/commerce/shipping";
import { formatNzPrice } from "@/lib/partner-offer";

export function VaultMarketShippingBar() {
  const threshold = formatNzPrice(FREE_SHIPPING_THRESHOLD_NZD);

  return (
    <div
      role="note"
      aria-label={`Free New Zealand shipping on StockUp orders over ${threshold}`}
      className="relative bg-[#10B981]"
    >
      <p className="mx-auto h-[22px] max-w-[1200px] overflow-hidden text-ellipsis whitespace-nowrap px-3 text-center text-[11px] font-semibold leading-[22px] tracking-tight text-white md:h-[26px] md:px-4 md:text-xs md:leading-[26px]">
        Free NZ Shipping on all orders over {threshold}
      </p>
    </div>
  );
}
