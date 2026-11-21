import { revalidatePath, revalidateTag } from "next/cache";

/** Drop the cached StockUp catalogue so price and stock edits show immediately. */
export function revalidateStockupCatalog() {
  revalidateTag("stockup-catalog", "max");
  revalidatePath("/", "layout");
}
