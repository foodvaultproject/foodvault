import Link from "next/link";

export function ReferralCTA() {
  return (
    <section className="bg-background py-5 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/discover"
          className="fv-btn-primary flex w-full items-center justify-center gap-2 rounded-sm px-8 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          Discover More Now
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
