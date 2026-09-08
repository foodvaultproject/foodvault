import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/AdminUi";
import { getPurchaseOrder } from "@/lib/admin/wms";
import { discrepancyLabel } from "@/lib/admin/wms-shared";
import { formatNzPrice } from "@/lib/partner-offer";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminPurchaseOrderPage({ params }: Props) {
  const { id } = await params;
  const order = await getPurchaseOrder(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/purchase-orders" className="text-sm font-semibold text-muted hover:text-primary">
        ← Back to purchase orders
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-foreground">{order.poNumber}</h1>
          <p className="mt-1 text-sm text-muted">{order.vendorName}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge label={order.status === "received" ? "RESOLVED" : "OPEN"} />
          {order.status === "open" || order.status === "receiving" ? (
            <Link
              href={`/admin/picker/receive/${order.id}`}
              className="fv-btn-primary rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Receive on picker
            </Link>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Ordered</th>
              <th className="px-4 py-3 font-semibold">Received</th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border/70 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                <td className="px-4 py-3 font-semibold">{item.name}</td>
                <td className="px-4 py-3 tabular-nums">{item.quantityOrdered}</td>
                <td className="px-4 py-3 tabular-nums">{item.quantityReceived}</td>
                <td className="px-4 py-3">{formatNzPrice(item.costPrice)}</td>
                <td className="px-4 py-3 text-muted">{discrepancyLabel(item.discrepancyReason)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
