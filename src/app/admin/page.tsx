import { requireAdminUser } from "@/lib/admin/auth";
import { openFoodVaultAdmin, openStockUpAdmin } from "@/lib/admin/workspace-actions";

const choices = [
  {
    action: openFoodVaultAdmin,
    name: "FoodVault",
    detail: "Partners, members, discover, and brand reports.",
    className: "border-[#8b7cf6] hover:bg-[#f5f2ff]",
    titleClass: "text-[#6f5ce8]",
  },
  {
    action: openStockUpAdmin,
    name: "StockUp",
    detail: "Orders, products, inventory, vendors, purchase orders, store reports, contact enquiries, and customers.",
    className: "border-[#10b981] hover:bg-[#ecfdf5]",
    titleClass: "text-[#047857]",
  },
] as const;

export default async function AdminIndexPage() {
  await requireAdminUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground">Choose a workspace</h1>
        <p className="mt-2 text-sm text-muted">
          Open FoodVault or StockUp. You will only see the tools for the one you choose.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {choices.map((choice) => (
            <form key={choice.name} action={choice.action}>
              <button
                type="submit"
                className={`flex h-full w-full flex-col rounded-lg border-2 bg-white p-6 text-left transition-colors ${choice.className}`}
              >
                <span className={`text-xl font-bold ${choice.titleClass}`}>{choice.name}</span>
                <span className="mt-2 text-sm text-muted">{choice.detail}</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
