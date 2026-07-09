import Link from "next/link";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";

export function PartnerCTA() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg bg-navy">
          <div className="grid items-center gap-8 p-6 sm:gap-10 sm:p-8 md:grid-cols-2 md:p-12 lg:gap-16 lg:p-16">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                Are You a Food Brand?
              </h2>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/70">
                Join 900+ independent food and beverage brands across New Zealand growing their
                customer base through FoodVault. You keep every customer — we
                just send them your way.
              </p>
              <Link
                href={PARTNER_CREATE_ACCOUNT_PATH}
                className="mt-8 fv-btn-primary inline-flex items-center justify-center rounded-sm px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
              >
                Become a Partner
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-5 sm:p-6">
                <p className="text-2xl font-bold text-white sm:text-3xl">Grow</p>
                <p className="mt-2 text-sm text-white/60">
                  Acquire new customers who shop direct on your site
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-5 sm:p-6">
                <p className="text-2xl font-bold text-white sm:text-3xl">Reach</p>
                <p className="mt-2 text-sm text-white/60">
                  Get in front of 28k+ engaged food-loving members across New Zealand
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
