import Link from "next/link";

export function FinalCTASection() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-lg bg-primary px-5 py-12 text-center sm:px-8 sm:py-16 md:px-16 md:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start saving?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Join thousands of New Zealand members saving on independent food
              and beverage brands every week.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
              >
                Join FoodVault Today
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                How Membership Works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
