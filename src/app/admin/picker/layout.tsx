import Link from "next/link";
import { adminLogoutAction, requireAdminUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function PickerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminUser();

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="print:hidden sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-primary/20 bg-primary px-4 text-primary-foreground">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">FoodVault Picker</p>
          <p className="truncate text-[11px] text-primary-foreground/80">Warehouse walk path</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin/picker"
            className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold"
          >
            Queue
          </Link>
          <Link
            href="/admin/picker/scan"
            className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold"
          >
            Scan Product Info
          </Link>
          <Link
            href="/admin/picker/receive"
            className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold"
          >
            Receive
          </Link>
          <Link
            href="/admin/dashboard"
            className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold"
          >
            Admin
          </Link>
          <form action={adminLogoutAction}>
            <button type="submit" className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
