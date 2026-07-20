import Image from "next/image";
import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";

export function HeroSection() {
  return (
    <section className="bg-surface-lavender">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-7 sm:px-6 sm:py-10 md:grid-cols-2 md:gap-12 lg:gap-16 lg:px-8 lg:py-14">
        <div>
          <span className="inline-flex rounded-full bg-success-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success">
            Membership Platform
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:mt-6 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Pay Less For The Food You Already Buy
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            Join 10,000+ New Zealand members saving up to 40% on their favourite
            independent food and beverage brands. Shop direct and save every month.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <MemberSignupCtaLink
              variant="start-free-trial"
              className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
            />
            <Link
              href="/browse-brands"
              className="inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-transparent px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary/5 sm:w-auto"
            >
              Browse Brands
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop"
              alt="Natural food and beverage products"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
          </div>
          <div className="absolute bottom-2 left-2 rounded-full bg-success px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:-bottom-4 sm:-left-4 sm:px-4 sm:py-2 sm:text-sm md:-bottom-6 md:-left-6">
            Save 25% on average
          </div>
        </div>
      </div>
    </section>
  );
}
